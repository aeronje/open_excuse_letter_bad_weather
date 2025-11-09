// api/himawari.js
export default async function handler(req, res) {
  const BASE = "https://www.data.jma.go.jp/mscweb/data/himawari/img/se2/";
  const PREFIX = "se2_b13_";
  const SUFFIX = ".jpg";
  const MAX_IMAGES = 30;

  try {
    // Current UTC time
    const now = new Date();
    const images = [];
    let attempts = 0;

    // Probe backward minute by minute up to ~6 hours (360 mins)
    for (let i = 0; i < 360 && images.length < MAX_IMAGES; i++) {
      const probe = new Date(now.getTime() - i * 60 * 1000);
      const hh = String(probe.getUTCHours()).padStart(2, "0");
      const mm = String(probe.getUTCMinutes()).padStart(2, "0");
      const fname = `${PREFIX}${hh}${mm}${SUFFIX}`;
      const url = `${BASE}${fname}`;

      // Check existence via HEAD (no content download)
      const check = await fetch(url, { method: "HEAD" });
      attempts++;

      if (check.ok) {
        images.unshift(url); // add to front to keep chronological order
      }

      // Safety: stop excessive probing if already tested 500 urls
      if (attempts > 500) break;
    }

    if (images.length === 0) {
      return res.status(404).json({ error: "No valid Himawari images found" });
    }

    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=300");
    res.status(200).json(images);
  } catch (err) {
    console.error("Himawari error:", err);
    res.status(500).json({ error: String(err) });
  }
}

