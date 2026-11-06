import fs from "node:fs/promises";
import path from "node:path";
import { createE2EFixtures } from "./fixtures";

export default async function globalSetup() {
  const battlesDir = path.join(process.cwd(), ".data/battles");
  await fs.mkdir(battlesDir, { recursive: true });

  const fixtures = createE2EFixtures();
  const createdFiles: string[] = [];

  for (const [id, data] of Object.entries(fixtures)) {
    const filePath = path.join(battlesDir, `${id}.json`);
    try {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), { flag: "w" });
      createdFiles.push(filePath);
    } catch (err) {
      console.warn(`Failed to write test fixture ${id}:`, err);
    }
  }

  // Teardown function executed after all Playwright tests finish
  return async () => {
    for (const filePath of createdFiles) {
      try {
        await fs.unlink(filePath);
      } catch {
        // quiet cleanup
      }
    }
  };
}
