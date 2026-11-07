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
      return `@${handle}: ${formatNum(prof.followers)} followers on Twitter hype, but only ${prof.publicRepos} public repos to back it up.`;
    }
    if (prof.languages.length === 1) {
      return `@${handle}: 100% of public code is in ${prof.languages[0].name}. Branching out into a second language might save your tech stack from deprecation.`;
    }
    return `@${handle}: ${prof.publicRepos} repos and ${prof.totalStars} stars. Consistent shipping, but still waiting on that breakout viral repository.`;
  };

  const player1Roast = getPlayerRoast(p1.handle, gh1, p1);
  const player2Roast = getPlayerRoast(p2.handle, gh2, p2);

  const winnerStars = winner === p1.handle ? (gh1?.totalStars ?? 0) : (gh2?.totalStars ?? 0);
  const loserRepos = winner === p1.handle ? (gh2?.publicRepos ?? 0) : (gh1?.publicRepos ?? 0);

  let headToHeadRoast = "";
  let punchline = "";

  switch (persona) {
    case "silicon_valley_vc":
      headToHeadRoast = isDraw
        ? `Open-source stalemate. Both @${p1.handle} and @${p2.handle} closed their seed round with identical ${p1.total} composite points. Zero defensible software moat.`
        : `Term sheet signed with @${winner}. While @${loser} pitched ${loserRepos} unstarred repositories, @${winner}'s ${formatNum(winnerStars)} stars demonstrated real product-market fit and developer traction.`;
      punchline = isDraw
        ? "DRAW: Both founders failed to capture developer mindshare. Pivot before the Series A."
        : `Winner: @${winner}. Clear product-market fit and open-source distribution dominance.`;
      break;

    case "ufc_announcer":
      headToHeadRoast = isDraw
        ? `UNANIMOUS DRAW! Five punishing rounds inside the GitHub Octagon between @${p1.handle} and @${p2.handle}, and the commit judges are dead split at ${p1.total}!`
        : `IT'S ALL OVER! In a brutal 5-round open-source slugfest, @${winner} drops @${loser} with an unstoppable ${formatNum(winnerStars)}-star knockout blow!`;
      punchline = isDraw
        ? "DRAW: Absolute bloodbath in the terminal! We need an immediate rematch!"
        : `Winner: @${winner}. AND STILL the undisputed champion of the open-source arena!`;
      break;

    case "hype_man":
      headToHeadRoast = isDraw
        ? `YO HOLD UP! @${p1.handle} and @${p2.handle} just locked up at ${p1.total} points each! Neither hacker is giving an inch on the commit graph!`
        : `TURN THE TERMINAL UP! @${winner} just dropped an absolute masterclass on @${loser}! Real stars, real releases, and zero filler repos!`;
      punchline = isDraw
        ? "DRAW: Pure heat from both terminals! Run it back in the next release cycle!"
        : `Winner: @${winner}. Heavyweight shipping, green checks, and total repository dominance!`;
      break;

    case "savage_dev":
    default: {
      const hash = hashMatch(winner || p1.handle, loser || p2.handle);
      const ghPunchlines = [
        `Winner: @${winner}. Clean production code merged to main; no revert required.`,
        `Winner: @${winner}. @${loser}'s 0-star ghost town repos were no match for real production code.`,
        `Winner: @${winner}. @${loser} collects empty repos like browser tabs while @${winner} actually ships.`,
        `Winner: @${winner}. Git blame says it all: @${loser} pushed broken CI while @${winner} merged to main.`,
        `Winner: @${winner}. @${loser}'s README has 1 star from an alt account; @${winner} has real downstream users.`,
      ];
      const ghH2H = [
        `Git blame says it all: @${winner} completely outclassed @${loser}. While @${loser} was collecting empty repositories like browser tabs (${loserRepos} repos), @${winner}'s code actually has users (${formatNum(winnerStars)} stars).`,
        `Repository inspection: @${winner} actually builds software people clone and star, while @${loser} has 40 cloned tutorials gathering dust with zero commits this year.`,
        `Open-source reality check: @${winner} shipped clean architectures and real releases, while @${loser}'s entire GitHub profile is a star desert.`,
      ];
      headToHeadRoast = isDraw
        ? `Open-source deadlock. Both @${p1.handle} and @${p2.handle} finished dead-even at ${p1.total} pts. Two identical README-driven developments, and neither one has production users.`
        : ghH2H[hash % ghH2H.length];
      punchline = isDraw
        ? "DRAW: Both push to main with failing CI. Neither deserves the merge."
        : ghPunchlines[hash % ghPunchlines.length];
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
