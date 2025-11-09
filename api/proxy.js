// api/proxy.js
export default async function handler(req, res) {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).send("Missing url parameter");

    let target;
    try { target = new URL(url); }
    catch { return res.status(400).send("Invalid url"); }

    const ALLOWED_HOSTS = ['noah.up.edu.ph'];
    if (!ALLOWED_HOSTS.includes(target.hostname))
      return res.status(403).send("Host not allowed");

    const fetchRes = await fetch(target.href, {
      headers: { 'User-Agent': req.headers['user-agent'] || 'vercel-proxy' },
      redirect: 'follow'
    });

    const contentType = fetchRes.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      let text = await fetchRes.text();

      const baseTag = `<base href="${target.origin}">`;
      const injectedHead = `
        ${baseTag}
        <meta name="viewport" content="width=device-width,initial-scale=1">
      `;
      text = text.replace(/<head(\s|>)/i, match => `${match}${injectedHead}`);

      // rewrite links to route through proxy
      text = text.replace(/(src|href)=["'](\/[^"']*)["']/gi,
        (m, attr, path) => `${attr}="/api/proxy?url=${encodeURIComponent(target.origin + path)}"`);
      const hostPattern = new RegExp(`(src|href)=["'](${target.origin.replace(/[-\/\\^$*+?.()|[\]{}]/g,'\\$&')}[^"']*)["']`, 'gi');
      text = text.replace(hostPattern,
        (m, attr, full) => `${attr}="/api/proxy?url=${encodeURIComponent(full)}"`);
      text = text.replace(/srcset=["']([^"']*)["']/gi, (m, s) => {
        const replaced = s.replace(/(https?:\/\/[^,\s]+|\/[^,\s]+)/g, urlItem => {
          const absolute = urlItem.startsWith('/') ? (target.origin + urlItem) : urlItem;
          return `/api/proxy?url=${encodeURIComponent(absolute)}`;
        });
        return `srcset="${replaced}"`;
      });

      // inject script that posts content size to parent
      const sizeScript = `
        <script>
          (function(){
            function sendSize(){
              try {
                var w = Math.max(document.documentElement.scrollWidth, document.body ? document.body.scrollWidth : 0) || 1200;
                var h = Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0) || 800;
                parent.postMessage({ type: 'proxied-size', width: w, height: h }, '*');
              } catch(e){}
            }
            window.addEventListener('load', function(){ sendSize(); setTimeout(sendSize,500); setTimeout(sendSize,1500); });
            try {
              var mo = new MutationObserver(function(){ sendSize(); });
              mo.observe(document.documentElement || document.body, { childList: true, subtree: true, attributes: true });
            } catch(e){}
            window.addEventListener('message', function(ev){ if(ev && ev.data && ev.data.type === 'request-size') sendSize(); });
            sendSize();
          })();
        </script>
      `;

      text = text.includes('</body>')
        ? text.replace('</body>', sizeScript + '</body>')
        : text + sizeScript;

      text = text.replace(/<meta[^>]*http-equiv=["']content-security-policy["'][^>]*>/gi, '');
      text = text.replace(/<meta[^>]*http-equiv=["']x-frame-options["'][^>]*>/gi, '');

      res.setHeader('content-type', 'text/html; charset=utf-8');
      res.send(text);
      return;
    }

    // handle static assets (css/js/img)
    const buffer = Buffer.from(await fetchRes.arrayBuffer());
    const ct = fetchRes.headers.get('content-type');
    if (ct) res.setHeader('content-type', ct);
    const cc = fetchRes.headers.get('cache-control');
    if (cc) res.setHeader('cache-control', cc);

    res.status(fetchRes.status).send(buffer);

  } catch (err) {
    console.error(err);
    res.status(500).send("Proxy error: " + String(err));
  }
}
