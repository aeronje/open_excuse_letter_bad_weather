export default async function handler(req, res) {
  const baseUrl = "https://www.data.jma.go.jp/mscweb/data/himawari/img/se2/";
  const prefix = "se2_snd_";

  // Himawari captures roughly every 10 minutes (UTC)
  const now = new Date();
  const images = [];
  const numImages = 30;

  for (let i = 0; i < numImages; i++) {
    const time = new Date(now.getTime() - i * 10 * 60 * 1000);
    const hh = time.getUTCHours().toString().padStart(2, "0");
    const mm = Math.floor(time.getUTCMinutes() / 10) * 10;
    const mmStr = mm.toString().padStart(2, "0");
    const name = `${prefix}${hh}${mmStr}.jpg`;
    images.push(baseUrl + name);
  }

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  res.status(200).json(images.reverse()); // oldest to newest
}

