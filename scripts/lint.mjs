import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const eslintBin = path.join(process.cwd(), "node_modules", "eslint", "bin", "eslint.js");
const nextBin = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
const tscBin = path.join(process.cwd(), "node_modules", "typescript", "bin", "tsc");

if (fs.existsSync(eslintBin)) {
  const res = spawnSync(process.execPath, [nextBin, "lint"], { stdio: "inherit" });
  process.exit(res.status ?? 0);
} else {
  console.log("[lint] ESLint is not present in local dependencies; running typecheck lint gate.");
  const res = spawnSync(process.execPath, [tscBin, "--noEmit"], { stdio: "inherit" });
  process.exit(res.status ?? 0);
}
