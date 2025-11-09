export default async function handler(req, res) {
  try {
    const base = "https://www.data.jma.go.jp/mscweb/data/himawari/img/se2/";
    const now = new Date();

    // generate last 30 images (every 10 min apart)
    const urls = [];
    for (let i = 0; i < 30; i++) {
      const t = new Date(now.getTime() - i * 10 * 60 * 1000);
      const hh = t.getUTCHours().toString().padStart(2, "0");
      const mm = t.getUTCMinutes().toString().padStart(2, "0");
      const url = `${base}se2_snd_${hh}${mm}.jpg`;
      urls.push(url);
    }

    res.setHeader("content-type", "application/json");
    res.setHeader("cache-control", "s-maxage=300, stale-while-revalidate");
    res.status(200).json(urls.reverse());
  } catch (err) {
    console.error("Himawari API Error:", err);
    res.status(500).json({ error: "failed to load images" });
  }
}

