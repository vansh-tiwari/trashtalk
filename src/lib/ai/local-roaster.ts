import { BattleVerdict } from "../battle/types";
import { CodechefEvidence, GithubEvidence, LeetcodeEvidence, PlatformEvidence } from "../platforms/contracts";
import { PROMPT_VERSION } from "./personas";
import { CommentaryResult, RoastPersona } from "./schemas";
import { generateGithubLocalRoast } from "./github-roaster";
import { GlobalRegionInfo } from "./global-regions";
import { generateRegionalLocalRoast } from "./regional-templates";

export interface LocalRoasterInput {
  p1Evidence: PlatformEvidence;
  p2Evidence: PlatformEvidence;
  verdict: BattleVerdict;
  persona: RoastPersona;
  platform?: string;
  regionInfo?: GlobalRegionInfo;
}

export function generateLocalCommentary({
  p1Evidence,
  p2Evidence,
  verdict,
  persona,
  platform,
  regionInfo,
}: LocalRoasterInput): CommentaryResult {
  if (regionInfo && !regionInfo.isEnglishDefault) {
    return generateRegionalLocalRoast({
      p1Evidence,
      p2Evidence,
      verdict,
      persona,
      platform,
      regionInfo,
    });
  }
  const p1 = verdict.player1Score;
  const p2 = verdict.player2Score;
  const isDraw = verdict.outcome === "draw";
  const winner = verdict.winnerHandle;
  const isLeetcode =
    platform === "leetcode" ||
    p1Evidence.platform === "leetcode" ||
    p2Evidence.platform === "leetcode";
  const isCodechef =
    platform === "codechef" ||
    p1Evidence.platform === "codechef" ||
    p2Evidence.platform === "codechef";
  const isGithub =
    platform === "github" ||
    p1Evidence.platform === "github" ||
    p2Evidence.platform === "github";

  if (isGithub) {
    return generateGithubLocalRoast({
      p1Evidence: p1Evidence as GithubEvidence,
      p2Evidence: p2Evidence as GithubEvidence,
      verdict,
      persona,
    });
  }

  let headToHeadRoast = "";
  let player1Roast = "";
  let player2Roast = "";
  let punchline = "";

  if (isLeetcode) {
    const lc1 = p1Evidence.platform === "leetcode" ? (p1Evidence as LeetcodeEvidence).profile : undefined;
    const lc2 = p2Evidence.platform === "leetcode" ? (p2Evidence as LeetcodeEvidence).profile : undefined;

    const getPlayerRoast = (handle: string, prof?: typeof lc1, score = p1) => {
      if (!prof) {
        return `@${handle}: ${score.metrics.solvedCount} solves on the grind, but still struggling when an interviewer asks to optimize from O(N) space.`;
      }
      const total = prof.totalSolved || score.metrics.solvedCount || 1;
      const easyRatio = prof.easySolved / total;

      if (easyRatio > 0.55) {
        return `@${handle}: ${total} solves looks impressive until you realize ${Math.round(easyRatio * 100)}% are Two Sum variations with hardcoded edge cases.`;
      }
      if (prof.contestsAttended === 0 && prof.hardSolved >= 20) {
        return `@${handle}: ${prof.hardSolved} Hard solves on the record, but zero Sunday contest receipts. Grinding with the editorial open doesn't count against a 90-minute timer.`;
      }
      if (prof.rank === "Guardian") {
        return `@${handle}: Guardian badge on the profile. Living proof that consistent contest attendance beats endless blind grinding.`;
      }
      if (prof.rank === "Knight") {
        return `@${handle}: Respectable Knight badge, but still taking time penalties on question 3 every other contest.`;
      }
      return `@${handle}: ${total} solves logged, but questionable runtime complexity when dynamic programming enters the chat.`;
    };

    player1Roast = getPlayerRoast(p1.handle, lc1, p1);
    player2Roast = getPlayerRoast(p2.handle, lc2, p2);

    switch (persona) {
      case "silicon_valley_vc":
        headToHeadRoast = isDraw
          ? `Two identical LeetCode pitch decks locked at ${p1.total} composite points. Zero defensible technical moat between @${p1.handle} and @${p2.handle}.`
          : `Term sheet goes to @${winner}. While @${p1.handle} and @${p2.handle} both pitched algorithm breadth, @${winner}'s solve depth proved actual engineering scale.`;
        punchline = isDraw
          ? "DRAW: Both candidates passed the phone screen. Neither earned the equity grant."
          : `Winner: @${winner}. Clear product-market fit in technical interview preparation.`;
        break;

      case "ufc_announcer":
        headToHeadRoast = isDraw
          ? `UNANIMOUS DRAW! Five punishing rounds of technical sparring between @${p1.handle} and @${p2.handle}, and the judges are completely split at ${p1.total}!`
          : `IT'S ALL OVER! In a grueling 5-round algorithm slugfest, @${winner} lands the knockout strike with superior problem depth and contest execution!`;
        punchline = isDraw
          ? "DRAW: An absolute bloodbath. We need an immediate rematch inside the Octagon!"
          : `Winner: @${winner}. AND STILL the undisputed champion of the leaderboard!`;
        break;

      case "hype_man":
        headToHeadRoast = isDraw
          ? `YO HOLD UP! @${p1.handle} and @${p2.handle} just locked up at ${p1.total} points each! Neither coder is giving up ground!`
          : `TURN THE SPEAKERS UP! @${winner} just dropped an absolute masterclass on the LeetCode leaderboard!`;
        punchline = isDraw
          ? "DRAW: Pure fire from both sides. Run it back in the next contest!"
          : `Winner: @${winner}. Optimal runtime, green checks, and total scoreboard dominance!`;
        break;

      case "savage_dev":
      default:
        headToHeadRoast = isDraw
          ? `Algorithmic deadlock. @${p1.handle} and @${p2.handle} both finished at ${p1.total} pts. Two identical submissions, both hitting TLE on the exact same test case.`
          : `@${winner} takes the match. While @${p1.handle} and @${p2.handle} both know their two pointers, @${winner}'s problem depth left the competition stuck on an O(N^2) brute force.`;
        punchline = isDraw
          ? "DRAW: Both survived the test cases. Neither earned the interview offer."
          : `Winner: @${winner}. Clean AC on all test cases with optimal time complexity.`;
        break;
    }
  } else if (isCodechef) {
    const cc1 = p1Evidence.platform === "codechef" ? (p1Evidence as CodechefEvidence).profile : undefined;
    const cc2 = p2Evidence.platform === "codechef" ? (p2Evidence as CodechefEvidence).profile : undefined;

    const getCodechefPlayerRoast = (handle: string, prof?: typeof cc1, score = p1) => {
      if (!prof) {
        return `@${handle}: ${score.metrics.solvedCount} solves in the arena, but still burning the soufflé when time runs short.`;
      }
      if (prof.stars && prof.stars >= 6) {
        return `@${handle}: ${prof.starString || `${prof.stars}★`} Michelin-grade rank in Div ${prof.division || 1}. Serving masterclasses while others panic over test cases.`;
      }
      if (prof.stars && prof.stars >= 4) {
        return `@${handle}: ${prof.starString || `${prof.stars}★`} in Div ${prof.division || 2}. Respectable prep, but still getting caught in the weeds on medium problems.`;
      }
      if (prof.stars && prof.stars <= 2) {
        return `@${handle}: ${prof.starString || `${prof.stars}★`} trainee in Div ${prof.division || 4}. 10 days on a Long Challenge with 15 StackOverflow tabs open.`;
      }
      return `@${handle}: ${prof.totalSolved || score.metrics.solvedCount} solves logged, but questionable runtime complexity when the heat turns up.`;
    };

    player1Roast = getCodechefPlayerRoast(p1.handle, cc1, p1);
    player2Roast = getCodechefPlayerRoast(p2.handle, cc2, p2);

    const loser = winner === p1.handle ? p2.handle : p1.handle;
    const peak = Math.max(p1.metrics.maxRating, p2.metrics.maxRating);

    switch (persona) {
      case "silicon_valley_vc":
        headToHeadRoast = isDraw
          ? `Two identical CodeChef pitch decks tied at ${p1.total} composite points. Zero defensible kitchen moat between @${p1.handle} and @${p2.handle}.`
          : `Term sheet goes to @${winner}. While @${p1.handle} and @${p2.handle} both pitched culinary scale, @${winner}'s ${peak} peak rating shows actual kitchen execution over @${loser}.`;
        punchline = isDraw
          ? "DRAW: Both founders failed the tasting menu. Pivot before the next contest."
          : `Winner: @${winner}. Clear product-market fit in competitive programming.`;
        break;

      case "ufc_announcer":
        headToHeadRoast = isDraw
          ? `UNANIMOUS DRAW! Five punishing rounds inside the CodeChef arena between @${p1.handle} and @${p2.handle}, and the judges are completely split at ${p1.total}!`
          : `IT'S ALL OVER! In a grueling 5-round slugfest, @${winner} cooks @${loser} with an unstoppable ${peak} peak rating!`;
        punchline = isDraw
          ? "DRAW: Absolute bloodbath in the kitchen! We need an immediate rematch!"
          : `Winner: @${winner}. AND STILL the undisputed head chef of the arena!`;
        break;

      case "hype_man":
        headToHeadRoast = isDraw
          ? `YO HOLD UP! @${p1.handle} and @${p2.handle} just served up a dead heat at ${p1.total} points each! Neither coder is giving up ground!`
          : `TURN THE HEAT UP! @${winner} just cooked up an absolute masterclass on the CodeChef scoreboard against @${loser}!`;
        punchline = isDraw
          ? "DRAW: Pure heat from both stations! Run it back in the next Starters!"
          : `Winner: @${winner}. Five-star flavor, green checks, and total scoreboard dominance!`;
        break;

      case "savage_dev":
      default:
        headToHeadRoast = isDraw
          ? `Kitchen deadlock. @${p1.handle} and @${p2.handle} both finished at ${p1.total} pts. Two identical submissions, both burning the test cases on Div 1 problem B.`
          : `Cooked to a crisp: @${winner} served @${loser} an absolute masterclass. While both showed up with chef hats, @${winner}'s rating ceiling (${peak}) left the competition washing dishes in Div 4.`;
        punchline = isDraw
          ? "DRAW: Both survived the kitchen timer. Neither earned a Michelin star."
          : `Winner: @${winner}. Clean AC on all test cases; order up!`;
        break;
    }
  } else {
    // Codeforces Roaster
    switch (persona) {
      case "silicon_valley_vc":
        headToHeadRoast = isDraw
          ? `Two identical pitch decks tied at ${p1.total} composite points. Zero defensible moat between @${p1.handle} and @${p2.handle}.`
          : `Term sheet goes to @${winner}. While @${p1.handle} and @${p2.handle} both pitched algorithmic scale, @${winner}'s ${Math.max(p1.metrics.maxRating, p2.metrics.maxRating)} peak rating shows actual market traction.`;
        player1Roast = `@${p1.handle}: High burn rate on submissions with ${p1.metrics.solvedCount} solves, but questionable unit economics on rating ROI.`;
        player2Roast = `@${p2.handle}: Promising seed-stage catalog, but ${p2.axes.recentVelocity}% velocity won't survive the Series A down-round.`;
        punchline = isDraw
          ? "DRAW: Down-round for both founders. Pivot before the next contest."
          : `Winner: @${winner}. Clear product-market fit in competitive problem solving.`;
        break;

      case "ufc_announcer":
        headToHeadRoast = isDraw
          ? `UNANIMOUS DRAW! Five punishing rounds between @${p1.handle} and @${p2.handle}, and the judges are completely split at ${p1.total}!`
          : `IT'S ALL OVER! In a brutal 5-round slugfest, @${winner} lands the knockout blow on the scorecards with an unstoppable ${Math.max(p1.metrics.maxRating, p2.metrics.maxRating)} peak!`;
        player1Roast = `@${p1.handle}: Stepped into the cage with ${p1.metrics.solvedCount} accepted strikes and a dangerous ${p1.metrics.rating} rating!`;
        player2Roast = `@${p2.handle}: Countered with ${p2.metrics.solvedCount} solves, but took too much damage during system tests!`;
        punchline = isDraw
          ? "DRAW: An absolute bloodbath. We need an immediate rematch inside the Octagon!"
          : `Winner: @${winner}. AND STILL the undisputed champion of the leaderboard!`;
        break;

      case "hype_man":
        headToHeadRoast = isDraw
          ? `YO HOLD UP! @${p1.handle} and @${p2.handle} just locked up at ${p1.total} points each! Nobody's backing down in this terminal!`
          : `TURN THE SPEAKERS UP! @${winner} just dropped a masterclass on the scoreboard with pure contest heat!`;
        player1Roast = `Big salute to @${p1.handle} pushing ${p1.metrics.solvedCount} accepted solves and holding that ${p1.metrics.rating} rating high!`;
        player2Roast = `@${p2.handle} brought serious energy with ${p2.metrics.solvedCount} solves on the grind. Respect the hustle!`;
        punchline = isDraw
          ? "DRAW: Pure fire from both sides. Run it back next round!"
          : `Winner: @${winner}. Hard work, green checks, and total scoreboard dominance!`;
        break;

      case "savage_dev":
      default:
        headToHeadRoast = isDraw
          ? `Algorithmic deadlock. @${p1.handle} and @${p2.handle} both finished at ${p1.total} pts. Two identical submissions, and neither one passed system tests.`
          : `@${winner} takes the match. While @${p1.handle} and @${p2.handle} both know their segment trees, @${winner}'s rating ceiling (${Math.max(p1.metrics.maxRating, p2.metrics.maxRating)}) left the competition stuck on pretest 2.`;
        player1Roast = `@${p1.handle}: Peak of ${p1.metrics.maxRating} is respectable, but ${p1.metrics.solvedCount} solves suggest more brute force than finesse.`;
        player2Roast = `@${p2.handle}: ${p2.metrics.solvedCount} solves across the board, but still getting hacked during the last five minutes of the round.`;
        punchline = isDraw
          ? "DRAW: Both survived system tests. Neither earned the rating bump."
          : `Winner: @${winner}. Clean AC on all test cases; no hacks required.`;
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
