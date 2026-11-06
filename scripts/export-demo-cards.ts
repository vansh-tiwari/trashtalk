import fs from "node:fs/promises";
import path from "node:path";
import { renderBattleCard } from "../src/lib/share/card-renderer";
import { PREPARED_TOURIST_VS_PETR } from "../src/lib/demo/prepared-battles";

async function exportCards() {
  const outDir = path.join(process.cwd(), "docs/review-evidence/2026-10-26-cool-social");
  await fs.mkdir(outDir, { recursive: true });

  const formats = ["og", "square", "story"] as const;

  for (const format of formats) {
    console.log(`Rendering demo card: ${format}...`);
    const res = await renderBattleCard(PREPARED_TOURIST_VS_PETR, format, {
      canonicalOrigin: "https://trashtalk.dev",
    });

    const buf = Buffer.from(await res.arrayBuffer());
    const filename = `card-${format}-${format === "og" ? "1200x630" : format === "square" ? "1080x1080" : "1080x1920"}.png`;
    const outPath = path.join(outDir, filename);
    await fs.writeFile(outPath, buf);
    console.log(`Saved ${outPath} (${buf.byteLength} bytes)`);
  }
}

exportCards().catch((err) => {
  console.error("Failed to export cards:", err);
  process.exit(1);
});
