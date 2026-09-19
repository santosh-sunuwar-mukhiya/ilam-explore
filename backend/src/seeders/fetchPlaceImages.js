// One-off helper: downloads local copies of the seeded place photos.
// Files land in backend/public/images/<slug>.jpg and are served at /static/<slug>.jpg
// Real photos + attribution come from the Wikimedia Commons API.
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "../../public/images");

// Commons file titles for each seeded destination
const ITEMS = [
  ["kanyam-tea-garden.jpg", "File:Kanyam tea garden Nepal.jpg"],
  ["antu-danda.jpg", "File:View from Antu Danda.JPG"],
  ["mai-pokhari.jpg", "File:Mai Pokhari ilam.jpg"],
  ["sandakpur.jpg", "File:Sun set from sandakpur.jpg"],
  ["fikkal-bazaar.jpg", "File:कन्याम, फिक्कल.JPG"],
  ["ilam-tea-estate.jpg", "File:Tea garden at ilam tea estate.jpg"],
  ["gajurmukhi-temple.jpg", "File:Tample Pasupatinagar Ilam.jpg"],
  ["todke-jharna.jpg", "File:Todke water fall.jpg"],
  ["siddhithumka.jpg", "File:Tea garden at ilam nepal.jpg"],
  ["chhintapu.jpg", "File:Lali Gurans in Antu Danda (Illam).JPG"],
  ["pashupatinagar.jpg", "File:Pashupatinagar, Suryodaya, Ilam.jpg"],
];

const stripHtml = (value = "") => value.replace(/<[^>]*>/g, "").trim();

const resolveImage = async (title) => {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("titles", title);
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|extmetadata");
  url.searchParams.set("iiurlwidth", "1400");
  url.searchParams.set("format", "json");

  const res = await fetch(url, { headers: { "User-Agent": "ilam-explore-seeder/1.0" } });
  const json = await res.json();
  const page = Object.values(json.query?.pages || {})[0];
  const info = page?.imageinfo?.[0];

  if (!info) throw new Error("not found on Commons");

  return {
    url: info.thumburl || info.url,
    author: stripHtml(info.extmetadata?.Artist?.value) || "Wikimedia Commons contributor",
    license: info.extmetadata?.LicenseShortName?.value || "see Commons file page",
    creditUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`,
  };
};

await fs.mkdir(outDir, { recursive: true });

const credits = [];
let ok = 0;
let failed = 0;

for (const [fileName, title] of ITEMS) {
  const target = path.join(outDir, fileName);

  try {
    const existing = await fs.stat(target).catch(() => null);
    const meta = await resolveImage(title);

    credits.push({
      fileName,
      source: meta.creditUrl,
      author: meta.author,
      license: meta.license,
    });

    if (existing && existing.size > 10000) {
      console.log(`- kept: ${fileName}`);
      ok += 1;
      continue;
    }

    const res = await fetch(meta.url, { headers: { "User-Agent": "ilam-explore-seeder/1.0" } });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${meta.url}`);

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 10000) throw new Error(`too small (${buffer.length} bytes)`);

    await fs.writeFile(target, buffer);
    console.log(`+ downloaded: ${fileName} (${Math.round(buffer.length / 1024)} KB, ${meta.license})`);
    ok += 1;
  } catch (err) {
    console.error(`x failed: ${fileName} -> ${err.message}`);
    failed += 1;
  }
}

await fs.writeFile(
  path.join(outDir, "CREDITS.json"),
  `${JSON.stringify(credits, null, 2)}\n`,
);

console.log("-----------------------------------------------");
console.log(`Available: ${ok}`);
console.log(`Failed: ${failed}`);
console.log(`Directory: ${outDir}`);
console.log("-----------------------------------------------");
