export default async function handler(req, res) {
  try {
    // Hardcoded target since only one site is proxied
    const targetUrl = "https://noah.up.edu.ph/noah-studio";
    const target = new URL(targetUrl);

    const fetchRes = await fetch(target.href, {
      headers: { "User-Agent": req.headers["user-agent"] || "vercel-proxy" },
      redirect: "follow",
    });

    const contentType = fetchRes.headers.get("content-type") || "";

    // HTML content
    if (contentType.includes("text/html")) {
      let text = await fetchRes.text();

      // Inject base + viewport
      const baseTag = `<base href="${target.origin}">`;
      const injectedHead = `
        ${baseTag}
        <meta name="viewport" content="width=device-width,initial-scale=1">
      `;
      text = text.replace(/<head(\s|>)/i, (m) => `${m}${injectedHead}`);

      // 🧠 UNIVERSAL LINK REWRITER (handles /, ./, and relative paths)
      text = text.replace(
        /(src|href)=["'](?!https?:\/\/)([^"'>]+)["']/gi,
        (m, attr, path) => {
          // Skip anchors and data URIs
          if (path.startsWith("#") || path.startsWith("data:")) return m;

          let absolute;
          if (path.startsWith("/")) {
            absolute = target.origin + path;
          } else if (path.startsWith("./")) {
            absolute = target.origin + path.slice(1);
          } else {
            // relative to current document path
            const base = target.href.replace(/\/[^/]*$/, "/");
            absolute = base + path;
          }

          return `${attr}="/api/proxy?url=${encodeURIComponent(absolute)}"`;
        }
      );

      // 🔁 Rewrite fully-qualified URLs from same host to pass through proxy
      const hostPattern = new RegExp(
        `(src|href)=["'](${target.origin.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}[^"']*)["']`,
        "gi"
      );
      text = text.replace(
        hostPattern,
        (m, attr, full) =>
          `${attr}="/api/proxy?url=${encodeURIComponent(full)}"`
      );

      // 🖼 Handle srcset for responsive images
      text = text.replace(/srcset=["']([^"']*)["']/gi, (m, s) => {
        const replaced = s.replace(/(https?:\/\/[^,\s]+|\/[^,\s]+)/g, (urlItem) => {
          const absolute = urlItem.startsWith("/")
            ? target.origin + urlItem
            : urlItem;
          return `/api/proxy?url=${encodeURIComponent(absolute)}`;
        });
        return `srcset="${replaced}"`;
      });

      // 📏 Inject dynamic resizing script for iframe scaling
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
            window.addEventListener('load', function(){
              sendSize();
              setTimeout(sendSize, 500);
              setTimeout(sendSize, 1500);
            });
            try {
              var mo = new MutationObserver(function(){ sendSize(); });
              mo.observe(document.documentElement || document.body, { childList: true, subtree: true, attributes: true });
            } catch(e){}
            window.addEventListener('message', function(ev){
              if(ev && ev.data && ev.data.type === 'request-size') sendSize();
            });
            sendSize();
          })();
        </script>
      `;

      text = text.includes("</body>")
        ? text.replace("</body>", sizeScript + "</body>")
        : text + sizeScript;

      // 🚫 Strip security meta tags that block embedding
      text = text.replace(
        /<meta[^>]*http-equiv=["']content-security-policy["'][^>]*>/gi,
        ""
      );
      text = text.replace(
        /<meta[^>]*http-equiv=["']x-frame-options["'][^>]*>/gi,
        ""
      );

      // ✅ Send back rewritten HTML
      res.setHeader("content-type", "text/html; charset=utf-8");
      res.send(text);
      return;
    }

    // 🧱 Handle static assets (CSS, JS, fonts, etc.)
    const buffer = Buffer.from(await fetchRes.arrayBuffer());
    const ct = fetchRes.headers.get("content-type");
    if (ct) res.setHeader("content-type", ct);
    const cc = fetchRes.headers.get("cache-control");
    if (cc) res.setHeader("cache-control", cc);
    res.status(fetchRes.status).send(buffer);

  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).send("Proxy error: " + String(err));
  }
}
