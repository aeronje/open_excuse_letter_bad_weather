// Ron Penones | November 10th 2025 - Feel free to share and reproduce, the core idea is mine with some assistance of AI. Padayon!
// Ang pinaka-simpleng explanation ng script na ito ay taga kuha ng mga latest na images mula sa Himawari satellite ng JMA.
// Take note lang mga bes na walang scraping at unauthorized usage ng API dito.
// Kung gusto mo mag test eh puntahan mo ang https://www.data.jma.go.jp/mscweb/data/himawari/img/se2/ open for public iyan libre.
// Magpasalamat tayo sa mga hapon dahil buti pa sila may ganyan sana pinas meron din - sana all.

export default async function handler(req, res) {
  const BASE = "https://www.data.jma.go.jp/mscweb/data/himawari/img/se2/";
  const PREFIX = "se2_b13_";
  const SUFFIX = ".jpg";
  const MAX_IMAGES = 30;

  try {
    // Current UTC time - UTC ang gamit ni Himawari katulad ng time sa London.
    const now = new Date();
    const images = [];
    let attempts = 0;

    // Ni-set ko ito ng 6 hours at doon magsisimula si nodejs maghalughog ng valid or existing images.
    for (let i = 0; i < 360 && images.length < MAX_IMAGES; i++) {
      const probe = new Date(now.getTime() - i * 60 * 1000);
      const hh = String(probe.getUTCHours()).padStart(2, "0");
      const mm = String(probe.getUTCMinutes()).padStart(2, "0");
      const fname = `${PREFIX}${hh}${mm}${SUFFIX}`;
      const url = `${BASE}${fname}`;

      // Magche-check ng existence via HEAD (no content download)
      const check = await fetch(url, { method: "HEAD" });
      attempts++;

      if (check.ok) {
        images.unshift(url); // Add to front para maayos ang pagkasunod-sunod.
      }

      // Safety: stop excessive probing if already tested 500 urls kasi minsan baka wala naman talagang images pa.
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

