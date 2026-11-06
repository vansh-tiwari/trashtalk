import fs from "node:fs/promises";
import path from "node:path";
import { fetchCodechefEvidence } from "../src/lib/platforms/codechef";

async function main() {
  const args = process.argv.slice(2);
  const handle = args[0] || "akulsareen";
  const saveFixture = args.includes("--save-fixture");

  console.log(`[CodeChef Dump] Fetching profile for @${handle}...`);

  try {
    const evidence = await fetchCodechefEvidence(handle);
    console.log(`[CodeChef Dump] Status: ${evidence.status}`);
    console.log(JSON.stringify(evidence, null, 2));

    if (saveFixture) {
      const outDir = path.join(process.cwd(), "tests/fixtures/codechef");
      await fs.mkdir(outDir, { recursive: true });
      const outPath = path.join(outDir, `${handle}.json`);
      await fs.writeFile(outPath, JSON.stringify(evidence, null, 2), "utf-8");
      console.log(`Saved fixture to ${outPath}`);
    }
  } catch (err) {
    console.error("[CodeChef Dump] Error:", err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
