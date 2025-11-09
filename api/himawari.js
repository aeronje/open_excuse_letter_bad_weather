export default async function handler(req, res) {
  try {
    const baseUrl = "https://www.data.jma.go.jp/mscweb/data/himawari/img/se2/";
    const images = [];
    const now = new Date();
    const utcHour = now.getUTCHours();
    const utcMinute = now.getUTCMinutes();

    // Generate last 30 intervals (10-minute spacing)
    for (let i = 0; i < 30; i++) {
      const mins = (utcHour * 60 + utcMinute) - i * 10;
      const h = Math.floor((mins % 1440) / 60)
        .toString()
        .padStart(2, "0");
      const m = (mins % 60).toString().padStart(2, "0");
      images.unshift(`${baseUrl}se2_snd_${h}${m}.jpg`);
    }

    res.setHeader("Content-Type", "application/json");
    res.status(200).json(images);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error: " + String(err));
  }
}

