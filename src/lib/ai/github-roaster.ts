import { BattleVerdict } from "../battle/types";
import { GithubEvidence } from "../platforms/contracts";
import { PROMPT_VERSION } from "./personas";
import { CommentaryResult, RoastPersona } from "./schemas";
import { formatNum } from "../battle/formatters";

interface GithubRoasterParams {
  p1Evidence: GithubEvidence;
  p2Evidence: GithubEvidence;
  verdict: BattleVerdict;
  persona: RoastPersona;
}

function hashMatch(s1: string, s2: string): number {
  let hash = 0;
  const str = `${s1}:${s2}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pickFresh<T>(items: T[], s1: string, s2: string): T {
  const base = hashMatch(s1, s2);
  const entropy = Math.floor(Math.random() * items.length);
  return items[(base + entropy) % items.length];
}

export function generateGithubLocalRoast({
  p1Evidence,
  p2Evidence,
  verdict,
  persona,
}: GithubRoasterParams): CommentaryResult {
  const p1 = verdict.player1Score;
  const p2 = verdict.player2Score;
  const isDraw = verdict.outcome === "draw";
  const winner = verdict.winnerHandle;
  const loser = isDraw ? null : winner === p1.handle ? p2.handle : p1.handle;
  const winnerScore = winner === p1.handle ? p1 : p2;
  const loserScore = winner === p1.handle ? p2 : p1;
  const margin = verdict.margin;

  const gh1 = p1Evidence.profile;
  const gh2 = p2Evidence.profile;

  const getPlayerRoast = (handle: string, prof?: typeof gh1, score = p1) => {
    if (!prof) {
      return `@${handle}: ${score.metrics.solvedCount} public repositories, but questionable commit history when inspecting the git log.`;
    }

    if (prof.totalStars === 0 && prof.publicRepos >= 10) {
      return `@${handle}: ${prof.publicRepos} repositories created, but an absolute star graveyard. Not even your own bot accounts starred the README.`;
    }
    if (prof.totalStars > 5000) {
      return `@${handle}: ${formatNum(prof.totalStars)} stars across the catalog. Legitimate open-source heavyweight with real downstream users.`;
    }
    if (prof.followers > 1000 && prof.publicRepos < 5) {
      return `@${handle}: ${formatNum(prof.followers)} followers on social hype, but only ${prof.publicRepos} public repos to back it up.`;
    }
    if (prof.languages.length === 1) {
      return `@${handle}: 100% of public code is in ${prof.languages[0].name}. Branching out into a second language might save your tech stack from deprecation.`;
    }
    return pickFresh(
      [
        `@${handle}: ${prof.publicRepos} repos and ${formatNum(prof.totalStars)} stars—consistent shipping, still chasing that breakout viral repository.`,
        `@${handle}: ${prof.publicRepos} public repositories across ${prof.languages.length} languages, though half of them are unfinished weekend side-projects.`,
        `@${handle}: ${formatNum(prof.totalStars)} stars and ${formatNum(prof.followers)} followers on the dossier; solid commit cadence when motivation strikes.`,
      ],
      handle,
      String(prof.publicRepos)
    );
  };

  const player1Roast = getPlayerRoast(p1.handle, gh1, p1);
  const player2Roast = getPlayerRoast(p2.handle, gh2, p2);

  const winnerProf = winner === p1.handle ? gh1 : gh2;
  const loserProf = winner === p1.handle ? gh2 : gh1;
  const winnerStars = winnerProf?.totalStars ?? 0;
  const loserStars = loserProf?.totalStars ?? 0;
  const winnerRepos = winnerProf?.publicRepos ?? 0;
  const loserRepos = loserProf?.publicRepos ?? 0;

  let headToHeadRoast = "";
  let punchline = "";

  switch (persona) {
    case "silicon_valley_vc": {
      const vcH2H = [
        `Term sheet signed with @${winner}. While @${loser} pitched ${loserRepos} unstarred repositories, @${winner}'s ${formatNum(winnerStars)} stars demonstrated real developer traction.`,
        `Open-source due diligence: @${winner} (${winnerScore.total} pts) took the round by +${margin} pts while @${loser}'s ${formatNum(loserStars)}-star catalog failed to show PMF.`,
        `Series A goes to @${winner}: real community adoption (${formatNum(winnerStars)} stars) beat @${loser}'s weekend side-project graveyard.`,
      ];
      const vcPunchlines = [
        `Winner: @${winner}. @${loser}'s repo catalog has zero developer mindshare.`,
        `Winner: @${winner}. +${margin} pts of open-source distribution over @${loser}.`,
        `Winner: @${winner}. @${loser} pitched README vaporware against real stars.`,
      ];
      headToHeadRoast = isDraw
        ? `Open-source stalemate. Both @${p1.handle} and @${p2.handle} closed their seed round with identical ${p1.total} composite points. Zero defensible software moat.`
        : pickFresh(vcH2H, winner || p1.handle, loser || p2.handle);
      punchline = isDraw
        ? "DRAW: Both founders failed to capture developer mindshare. Pivot before the Series A."
        : pickFresh(vcPunchlines, winner || p1.handle, loser || p2.handle);
      break;
    }

    case "ufc_announcer": {
      const ufcH2H = [
        `IT'S ALL OVER! In a brutal 5-round open-source slugfest, @${winner} drops @${loser} (${winnerScore.total}–${loserScore.total}) with an unstoppable ${formatNum(winnerStars)}-star knockout blow!`,
        `REFEREE STOPS THE MERGE! @${winner} dominates @${loser} by +${margin} points inside the GitHub Octagon!`,
        `TOTAL TERMINAL CONTROL! @${winner}'s ${winnerRepos} repositories and ${formatNum(winnerStars)} stars overwhelmed @${loser}'s defense!`,
      ];
      const ufcPunchlines = [
        `Winner: @${winner}. @${loser} got knocked out in the git log by +${margin} points!`,
        `Winner: @${winner}. A ${formatNum(winnerStars)}-star haymaker sent @${loser} to the canvas!`,
        `Winner: @${winner}. AND STILL the undisputed open-source champion over @${loser}!`,
      ];
      headToHeadRoast = isDraw
        ? `UNANIMOUS DRAW! Five punishing rounds inside the GitHub Octagon between @${p1.handle} and @${p2.handle}, and the commit judges are dead split at ${p1.total}!`
        : pickFresh(ufcH2H, winner || p1.handle, loser || p2.handle);
      punchline = isDraw
        ? "DRAW: Absolute bloodbath in the terminal! We need an immediate rematch!"
        : pickFresh(ufcPunchlines, winner || p1.handle, loser || p2.handle);
      break;
    }

    case "hype_man": {
      const hypeH2H = [
        `TURN THE TERMINAL UP! @${winner} just dropped an absolute masterclass (${winnerScore.total}–${loserScore.total}) on @${loser}! Real stars, real releases, and zero filler repos!`,
        `COMMIT GRAPH ON FIRE! @${winner} flexed ${formatNum(winnerStars)} stars and a +${margin}-point victory over @${loser}!`,
        `OPEN-SOURCE ROYALTY! @${winner} shipped heavyweight code across ${winnerRepos} repos while @${loser} watched from the fork button!`,
      ];
      const hypePunchlines = [
        `Winner: @${winner}. Heavyweight shipping and +${margin}-pt dominance over @${loser}!`,
        `Winner: @${winner}. ${formatNum(winnerStars)} stars of pure open-source heat on @${loser}!`,
        `Winner: @${winner}. @${loser} couldn't match the shipping velocity today!`,
      ];
      headToHeadRoast = isDraw
        ? `YO HOLD UP! @${p1.handle} and @${p2.handle} just locked up at ${p1.total} points each! Neither hacker is giving an inch on the commit graph!`
        : pickFresh(hypeH2H, winner || p1.handle, loser || p2.handle);
      punchline = isDraw
        ? "DRAW: Pure heat from both terminals! Run it back in the next release cycle!"
        : pickFresh(hypePunchlines, winner || p1.handle, loser || p2.handle);
      break;
    }

    case "savage_dev":
    default: {
      const ghPunchlines = [
        `Winner: @${winner}. @${loser}'s ghost-town repos were no match for real production code.`,
        `Winner: @${winner}. @${loser} collects empty repos like browser tabs while @${winner} ships.`,
        `Winner: @${winner}. Git blame says it all: @${loser} pushed broken CI while @${winner} merged.`,
        `Winner: @${winner}. @${loser}'s ${formatNum(loserStars)} stars got eclipsed by @${winner}'s ${formatNum(winnerStars)}.`,
        `Winner: @${winner}. ${winnerScore.total}–${loserScore.total}; file an issue in @${loser}'s repo for condolences.`,
        `Winner: @${winner}. @${loser}'s commit graph is 90% README typo fixes.`,
        `Winner: @${winner}. +${margin} pts gap; @${loser}'s side projects died after the initial commit.`,
        `Winner: @${winner}. @${loser} forked 20 tutorials while @${winner} shipped real upstream code.`,
        `Winner: @${winner}. @${loser}'s ` + "`node_modules`" + ` has more stars than their entire profile.`,
        `Winner: @${winner}. @${loser} got ` + "`git reset --hard`" + ` off the scoreboard by +${margin} pts.`,
      ];
      const ghH2H = [
        `Git blame says it all: @${winner} completely outclassed @${loser} (${winnerScore.total}–${loserScore.total}). While @${loser} was collecting repositories like browser tabs (${loserRepos} repos), @${winner}'s code actually has users (${formatNum(winnerStars)} stars).`,
        `Repository inspection: @${winner} (+${margin} pts) builds software people actually clone and star (${formatNum(winnerStars)} stars), while @${loser} (${formatNum(loserStars)} stars) has abandoned side-projects gathering dust.`,
        `Open-source reality check: @${winner} shipped clean architectures and real releases across ${winnerRepos} repos, leaving @${loser} trailing at ${loserScore.total} composite points.`,
        `Commit log audit: @${winner} dominated Star Gravity (${winnerScore.axes.algorithmicGrit}/100) and Community Footprint (${winnerScore.axes.recentVelocity}/100), while @${loser}'s profile read like a graveyard of ` + "`Initial commit`" + ` repos.`,
        `No contest in the terminal: @${winner} (${winnerScore.total} pts) brought verified open-source gravity while @${loser} (${loserScore.total} pts) was busy tweaking dotfiles.`,
      ];
      headToHeadRoast = isDraw
        ? `Open-source deadlock. Both @${p1.handle} and @${p2.handle} finished dead-even at ${p1.total} pts. Two identical README-driven developments, and neither one has production users.`
        : pickFresh(ghH2H, winner || p1.handle, loser || p2.handle);
      punchline = isDraw
        ? "DRAW: Both push to main with failing CI. Neither deserves the merge."
        : pickFresh(ghPunchlines, winner || p1.handle, loser || p2.handle);
      break;
    }
  }

  return {
    source: "local",
    persona,
    headToHeadRoast,
    player1Roast,
    player2Roast,
    punchline,
    winnerHandle: isDraw ? null : winner,
    promptVersion: PROMPT_VERSION,
  };
}

export function buildGithubRoastPrompt({
  p1Evidence,
  p2Evidence,
  verdict,
  persona,
}: GithubRoasterParams): string {
  const gh1 = p1Evidence.profile;
  const gh2 = p2Evidence.profile;
  const winner = verdict.winnerHandle;
  const loser = verdict.loserHandle;

  return `
You are the world's sharpest developer rival roaster specializing in GitHub open-source profiles.
Persona style: ${persona}.
Scoring Result:
- Winner: ${winner ?? "DRAW"}
- Margin: +${verdict.margin} pts
- Player 1 (@${p1Evidence.handle}): Score ${verdict.player1Score.total}/100, ${gh1?.publicRepos ?? 0} repos, ${gh1?.totalStars ?? 0} stars, ${gh1?.followers ?? 0} followers, Languages: ${gh1?.languages.map((l) => l.name).join(", ") || "None"}.
- Player 2 (@${p2Evidence.handle}): Score ${verdict.player2Score.total}/100, ${gh2?.publicRepos ?? 0} repos, ${gh2?.totalStars ?? 0} stars, ${gh2?.followers ?? 0} followers, Languages: ${gh2?.languages.map((l) => l.name).join(", ") || "None"}.

CONTRADICTION GUARD (STRICT MANDATORY):
- The scoreboard verdict is authoritative: WINNER: ${winner ?? "DRAW"}.
- Under NO CIRCUMSTANCES may your commentary declare ${loser} as the winner.
- Deliver:
  1. A headToHeadRoast (2-3 sentences contrasting their open-source impact, repos vs stars, and commit habits).
  2. A savage 1-sentence player1Roast.
  3. A savage 1-sentence player2Roast.
  4. A final 1-line punchline starting with "Winner: @${winner}." (or "DRAW: ...").
Respond in valid JSON matching the schema.
`;
}
