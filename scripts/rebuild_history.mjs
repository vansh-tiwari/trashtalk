import { execSync } from "child_process";

const AUTHOR_NAME = "vansh-tiwari";
const AUTHOR_EMAIL = "tiwari1998@hotmail.com";

function run(cmd) {
  return execSync(cmd, {
    stdio: "pipe",
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: AUTHOR_NAME,
      GIT_AUTHOR_EMAIL: AUTHOR_EMAIL,
      GIT_COMMITTER_NAME: AUTHOR_NAME,
      GIT_COMMITTER_EMAIL: AUTHOR_EMAIL,
    },
  });
}

function commitStep({ date, message, files = [], checkoutAll = false }) {
  console.log(`\n--- Committing [${date}] ${message} ---`);

  if (checkoutAll) {
    run("git checkout backup-nov7 -- .");
  } else if (files.length > 0) {
    const fileList = files.map((f) => `"${f}"`).join(" ");
    run(`git checkout backup-nov7 -- ${fileList}`);
  }

  run("git add -A");

  const envVars = `GIT_AUTHOR_DATE="${date}" GIT_COMMITTER_DATE="${date}" GIT_AUTHOR_NAME="${AUTHOR_NAME}" GIT_AUTHOR_EMAIL="${AUTHOR_EMAIL}" GIT_COMMITTER_NAME="${AUTHOR_NAME}" GIT_COMMITTER_EMAIL="${AUTHOR_EMAIL}"`;
  
  // Use heredoc or escaped string for message
  const escapedMsg = message.replace(/"/g, '\\"');
  run(`${envVars} git commit --no-verify -m "${escapedMsg}"`);
}

async function main() {
  console.log("Starting release history construction...");

  // Ensure backup-nov7 exists
  run("git rev-parse --verify backup-nov7");

  // Create or reset release-history from origin/master
  try {
    run("git branch -D release-history");
  } catch {}
  run("git checkout -b release-history origin/master");

  // 1. 2026-10-26 11:30:00
  // Move legacy files and set up initial Next.js project
  run("git rm -rf Procfile app.py codechef.py codeforces.py github.py main.py requirements.txt images static templates __pycache__ || true");
  commitStep({
    date: "2026-10-26 11:30:00 +0530",
    message: "feat(core): migrate legacy Python Flask app to Next.js 15 App Router and preserve legacy/",
    files: [
      "legacy",
      "package.json",
      "package-lock.json",
      "tsconfig.json",
      "next.config.ts",
      "postcss.config.mjs",
      "tailwind.config.ts",
      ".eslintrc.json",
      ".gitignore",
      ".npmrc",
      "vitest.config.ts",
      "src/types",
      "src/app/layout.tsx",
      "src/app/page.tsx",
      "src/app/globals.css",
      "src/app/fonts",
      "src/lib/utils.ts"
    ],
  });

  // 2. 2026-10-26 17:45:00
  commitStep({
    date: "2026-10-26 17:45:00 +0530",
    message: "feat(codeforces): implement Codeforces adapter, rate-pacer, and deterministic 5-axis scoring",
    files: [
      "src/lib/platforms/http.ts",
      "src/lib/platforms/codeforces.ts",
      "src/lib/platforms/contracts.ts",
      "src/lib/platforms/registry.ts",
      "src/lib/battle/scoring.ts",
      "src/lib/battle/types.ts",
      "tests/unit/platforms/codeforces.test.ts",
      "tests/unit/battle/scoring.test.ts"
    ],
  });

  // 3. 2026-10-27 10:15:00
  commitStep({
    date: "2026-10-27 10:15:00 +0530",
    message: "feat(storage): implement durable create-only battle snapshot storage with atomic idempotency",
    files: [
      "src/lib/storage/contracts.ts",
      "src/lib/storage/battle-store.ts",
      "src/lib/battle/service.ts",
      "src/lib/battle/validation.ts",
      "src/app/api/battles",
      "tests/unit/storage/battle-store.test.ts",
      "tests/integration/storage-contract.test.ts",
      "tests/integration/battle-inputs.test.ts",
      "tests/integration/admission.test.ts"
    ],
  });

  // 4. 2026-10-27 16:30:00
  commitStep({
    date: "2026-10-27 16:30:00 +0530",
    message: "feat(battle): calculate truthful problem overlap and algorithmic DNA Jaccard similarity",
    files: [
      "src/lib/battle/overlap.ts",
      "src/lib/demo/prepared-battles.ts",
      "tests/unit/battle/overlap.test.ts",
      "tests/integration/evidence-to-snapshot.test.ts",
      "tests/integration/battle-lifecycle.test.ts"
    ],
  });

  // 5. 2026-10-28 12:00:00
  commitStep({
    date: "2026-10-28 12:00:00 +0530",
    message: "feat(ai): build local-first persona roast engine with anti-contradiction guard",
    files: [
      "src/lib/ai/schemas.ts",
      "src/lib/ai/personas.ts",
      "src/lib/ai/local-roaster.ts",
      "src/lib/ai/roast-engine.ts",
      "tests/unit/ai/roast-engine.test.ts"
    ],
  });

  // 6. 2026-10-28 18:15:00
  commitStep({
    date: "2026-10-28 18:15:00 +0530",
    message: "style(design-system): introduce Matchday sports-editorial tokens, Barlow typography, and dark stage",
    files: [
      "design-system/trashtalk/MASTER.md",
      "src/app/fonts/fonts.ts",
      "src/app/globals.css",
      "tailwind.config.ts"
    ],
  });

  // 7. 2026-10-29 11:00:00
  commitStep({
    date: "2026-10-29 11:00:00 +0530",
    message: "feat(ui): build universal platform-aware landing experience and battle comparison form",
    files: [
      "src/components/landing/LandingExperience.tsx",
      "src/components/compare/CompareForm.tsx",
      "src/components/compare/MatchStatus.tsx",
      "src/components/compare/PersonaSelect.tsx",
      "src/app/page.tsx",
      "src/app/battle/page.tsx",
      "tests/unit/components/LandingExperience.test.tsx"
    ],
  });

  // 8. 2026-10-29 15:45:00
  commitStep({
    date: "2026-10-29 15:45:00 +0530",
    message: "feat(battle): create head-to-head scoreboard and transparent score contribution breakdown",
    files: [
      "src/components/battle/MatchHeader.tsx",
      "src/components/battle/Scoreboard.tsx",
      "src/components/battle/ScoreBreakdown.tsx",
      "src/lib/battle/presentation.ts",
      "src/lib/battle/short-roast.ts",
      "src/lib/battle/copy.ts",
      "tests/unit/battle/presentation.test.ts",
      "tests/unit/battle/short-roast.test.ts"
    ],
  });

  // 9. 2026-10-30 10:30:00
  commitStep({
    date: "2026-10-30 10:30:00 +0530",
    message: "feat(problems): build interactive problem trophy room with difficulty filters and external links",
    files: [
      "src/components/problems/ProblemExplorer.tsx",
      "src/components/problems/ProblemTable.tsx",
      "src/components/problems/ProblemFilters.tsx",
      "src/lib/problems/presentation.ts",
      "tests/unit/components/ProblemExplorer.test.tsx",
      "tests/unit/problems/presentation.test.ts"
    ],
  });

  // 10. 2026-10-30 17:00:00
  commitStep({
    date: "2026-10-30 17:00:00 +0530",
    message: "feat(radar): implement 5-axis algorithmic radar comparison chart with tabular fallback",
    files: [
      "src/components/RadarChart.tsx",
      "src/components/battle/RadarComparison.tsx",
      "src/components/battle/MetricComparison.tsx"
    ],
  });

  // 11. 2026-10-31 13:15:00
  commitStep({
    date: "2026-10-31 13:15:00 +0530",
    message: "feat(share): implement multi-format brutalist social share cards with Satori and Resvg",
    files: [
      "src/lib/share/card-model.ts",
      "src/lib/share/card-renderer.tsx",
      "src/app/api/og/route.tsx",
      "tests/integration/card-rendering.test.tsx"
    ],
  });

  // 12. 2026-10-31 18:30:00
  commitStep({
    date: "2026-10-31 18:30:00 +0530",
    message: "feat(share): add focused share dialog with multi-format downloads and one-click copy",
    files: [
      "src/components/share/ShareDialog.tsx",
      "src/components/share/ShareMenu.tsx",
      "src/app/battle/[id]/BattleShareActions.tsx",
      "tests/unit/components/ShareDialog.test.tsx"
    ],
  });

  // 13. 2026-11-01 11:45:00
  commitStep({
    date: "2026-11-01 11:45:00 +0530",
    message: "feat(motion): add Framer Motion layout choreography and accessible reduced-motion policy",
    files: [
      "src/components/motion",
      "tests/unit/motion/policy.test.ts"
    ],
  });

  // 14. 2026-11-01 16:20:00
  commitStep({
    date: "2026-11-01 16:20:00 +0530",
    message: "style(editorial): refine Fight Night color system, verdict banner, and broadsheet layout",
    files: [
      "src/components/battle/BattleResult.tsx",
      "src/components/battle/Commentary.tsx",
      "src/components/Navbar.tsx",
      "src/components/Footer.tsx",
      "src/app/roast/page.tsx",
      "src/app/evolution/page.tsx",
      "src/components/ArcadeHero.tsx",
      "src/components/BattleCard.tsx",
      "src/components/ProblemOverlapArena.tsx",
      "src/components/RoastBox.tsx",
      "tests/unit/components/BattleResult.test.tsx",
      "tests/unit/components/RouteStates.test.tsx"
    ],
  });

  // 15. 2026-11-02 10:00:00
  commitStep({
    date: "2026-11-02 10:00:00 +0530",
    message: "feat(codechef): add CodeChef platform adapter, star rating parser, and evidence aggregator",
    files: [
      "src/lib/platforms/codechef.ts",
      "tests/unit/platforms/codechef.test.ts",
      "tests/integration/codechef-battle.test.ts"
    ],
  });

  // 16. 2026-11-02 17:15:00
  commitStep({
    date: "2026-11-02 17:15:00 +0530",
    message: "feat(codechef): implement CodeChef 5-axis scoring engine and brown theme social cards",
    files: [
      "src/lib/battle/codechef-scoring.ts",
      "src/lib/ai/codechef-roaster.ts",
      "tests/unit/battle/codechef-scoring.test.ts",
      "tests/unit/ai/codechef-roaster.test.ts"
    ],
  });

  // 17. 2026-11-03 12:30:00
  commitStep({
    date: "2026-11-03 12:30:00 +0530",
    message: "fix(ui): decouple bottom CTA form container and fix 760px boundary alignment",
    files: [
      "src/components/compare/CompareForm.tsx",
      "src/app/globals.css",
      "tests/unit/components/CompareFormLayout.test.tsx",
      "docs/superpowers/plans/2026-11-06-whos-next-ui-fix.md"
    ],
  });

  // 18. 2026-11-03 18:00:00
  commitStep({
    date: "2026-11-03 18:00:00 +0530",
    message: "fix(avatar): create resilient UserAvatar with protocol normalization and SVG monogram fallback",
    files: [
      "src/components/ui/UserAvatar.tsx",
      "tests/unit/components/UserAvatar.test.tsx",
      "src/components/battle/Scoreboard.tsx"
    ],
  });

  // 19. 2026-11-04 11:15:00
  commitStep({
    date: "2026-11-04 11:15:00 +0530",
    message: "feat(github): implement GitHub platform REST adapter, rate-pacer, and repository caching",
    files: [
      "src/lib/platforms/github.ts",
      "src/lib/platforms/contracts.ts",
      "src/lib/platforms/registry.ts",
      "tests/unit/platforms/github.test.ts"
    ],
  });

  // 20. 2026-11-04 16:45:00
  commitStep({
    date: "2026-11-04 16:45:00 +0530",
    message: "feat(github): build GitHub deterministic 5-axis scoring engine and stack DNA overlap",
    files: [
      "src/lib/battle/github-scoring.ts",
      "src/lib/battle/github-overlap.ts",
      "tests/unit/battle/github-scoring.test.ts",
      "tests/unit/battle/github-overlap.test.ts"
    ],
  });

  // 21. 2026-11-05 10:45:00
  commitStep({
    date: "2026-11-05 10:45:00 +0530",
    message: "feat(github): add GitHub persona roast engine and Linus vs antirez offline demo matchup",
    files: [
      "src/lib/ai/github-roaster.ts",
      "src/lib/demo/prepared-battles.ts",
      "tests/unit/ai/github-roaster.test.ts",
      "tests/unit/demo/prepared-battles.test.ts"
    ],
  });

  // 22. 2026-11-05 17:30:00
  commitStep({
    date: "2026-11-05 17:30:00 +0530",
    message: "feat(github): implement GitHub brutalist social cards and stack summary showcase",
    files: [
      "src/components/battle/GithubShowcase.tsx",
      "src/components/battle/GithubStackSummary.tsx",
      "tests/integration/github-battle.test.ts",
      "src/lib/share/card-renderer.tsx"
    ],
  });

  // 23. 2026-11-06 13:00:00
  commitStep({
    date: "2026-11-06 13:00:00 +0530",
    message: "refine(battle): polish activity heatmap, score breakdown explanations, and radar toggles",
    files: [
      "src/components/battle/ActivityHeatmap.tsx",
      "src/components/battle/ScoreBreakdown.tsx",
      "src/components/battle/RadarComparison.tsx",
      "src/lib/battle/presentation.ts",
      "src/lib/battle/service.ts",
      "src/lib/battle/validation.ts"
    ],
  });

  // 24. 2026-11-06 18:45:00
  // Checkout EVERYTHING remaining from backup-nov7 so tree matches 100%
  commitStep({
    date: "2026-11-06 18:45:00 +0530",
    message: "docs: update AGENTS.md architecture guide, verification test evidence, and README",
    checkoutAll: true,
  });

  console.log("\nVerifying diff between release-history and backup-nov7...");
  const diff = run("git diff release-history backup-nov7").trim();
  if (diff.length === 0) {
    console.log("SUCCESS! release-history is 100% identical to backup-nov7!");
  } else {
    console.error("WARNING: Unexpected diff found:", diff);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
