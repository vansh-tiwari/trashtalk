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
  const winner = verdict.winnerHandle || p1.handle;
  const loser = winner === p1.handle ? p2.handle : p1.handle;
  const winnerScore = winner === p1.handle ? p1 : p2;
  const loserScore = winner === p1.handle ? p2 : p1;
  const margin = verdict.margin;

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
        return pickFresh(
          [
            `@${handle}: ${score.metrics.solvedCount} solves on the grind, but still struggling when an interviewer asks to optimize from O(N) space.`,
            `@${handle}: ${score.metrics.solvedCount} problems logged, yet dynamic programming still triggers an immediate tab switch to the editorial.`,
            `@${handle}: ${score.metrics.solvedCount} accepted submissions, mostly brute-forcing test cases until the judge gives up.`,
          ],
          handle,
          String(score.total)
        );
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
      return pickFresh(
        [
          `@${handle}: ${total} solves logged, but questionable runtime complexity when dynamic programming enters the chat.`,
          `@${handle}: ${total} problems solved (${prof.hardSolved} Hard), yet still sweating whenever a graph traversal shows up in Q3.`,
          `@${handle}: ${prof.mediumSolved} Mediums cleared, but that ${score.metrics.rating} contest rating says the 90-minute clock wins more often than not.`,
        ],
        handle,
        String(total)
      );
    };

    player1Roast = getPlayerRoast(p1.handle, lc1, p1);
    player2Roast = getPlayerRoast(p2.handle, lc2, p2);

    switch (persona) {
      case "silicon_valley_vc": {
        const vcH2H = [
          `Term sheet goes to @${winner} (+${margin} pts). While both pitched algorithm breadth, @${winner}'s ${winnerScore.metrics.solvedCount} solves proved real engineering scale over @${loser}.`,
          `Due diligence complete: @${winner} closed the round at ${winnerScore.total} pts while @${loser}'s ${loserScore.total}-pt pitch deck collapsed during technical screening.`,
          `Series A goes to @${winner}. @${loser} burned too much runway on Easy problems without building a defensible Hard-problem moat.`,
        ];
        const vcPunchlines = [
          `Winner: @${winner}. @${loser} failed technical due diligence before the term sheet.`,
          `Winner: @${winner}. @${loser}'s LeetCode metrics just got down-rounded by +${margin} points.`,
          `Winner: @${winner}. Zero defensible moat left in @${loser}'s interview prep.`,
        ];
        headToHeadRoast = isDraw
          ? `Two identical LeetCode pitch decks locked at ${p1.total} composite points. Zero defensible technical moat between @${p1.handle} and @${p2.handle}.`
          : pickFresh(vcH2H, winner, loser);
        punchline = isDraw
          ? "DRAW: Both candidates passed the phone screen. Neither earned the equity grant."
          : pickFresh(vcPunchlines, winner, loser);
        break;
      }

      case "ufc_announcer": {
        const ufcH2H = [
          `IT'S ALL OVER! In a grueling 5-round algorithm slugfest, @${winner} lands the knockout strike (${winnerScore.total}–${loserScore.total}) with superior problem depth!`,
          `REFEREE STOPS THE CONTEST! @${winner} dismantles @${loser} by ${margin} points across the LeetCode scorecards!`,
          `TOTAL OCTAGON CONTROL! @${winner} pushed a relentless ${winnerScore.metrics.solvedCount}-solve pace that left @${loser} gasping in round four!`,
        ];
        const ufcPunchlines = [
          `Winner: @${winner}. @${loser} tapped out to dynamic programming in round three!`,
          `Winner: @${winner}. A +${margin}-point knockout that sent @${loser} to the prelims!`,
          `Winner: @${winner}. AND STILL the undisputed champion over @${loser}!`,
        ];
        headToHeadRoast = isDraw
          ? `UNANIMOUS DRAW! Five punishing rounds of technical sparring between @${p1.handle} and @${p2.handle}, and the judges are completely split at ${p1.total}!`
          : pickFresh(ufcH2H, winner, loser);
        punchline = isDraw
          ? "DRAW: An absolute bloodbath. We need an immediate rematch inside the Octagon!"
          : pickFresh(ufcPunchlines, winner, loser);
        break;
      }

      case "hype_man": {
        const hypeH2H = [
          `TURN THE SPEAKERS UP! @${winner} just dropped a ${winnerScore.total}–${loserScore.total} masterclass on the LeetCode leaderboard over @${loser}!`,
          `PURE ALGORITHM HEAT! @${winner} stacked ${winnerScore.metrics.solvedCount} solves and took the crown by +${margin} points!`,
          `STOP THE PRESSES! @${winner} turned the weekly contest into a highlight reel while @${loser} watched from the sidelines!`,
        ];
        const hypePunchlines = [
          `Winner: @${winner}. Optimal runtime and total scoreboard dominance over @${loser}!`,
          `Winner: @${winner}. +${margin} points of pure green-check energy on @${loser}!`,
          `Winner: @${winner}. @${loser} couldn't match the contest velocity today!`,
        ];
        headToHeadRoast = isDraw
          ? `YO HOLD UP! @${p1.handle} and @${p2.handle} just locked up at ${p1.total} points each! Neither coder is giving up ground!`
          : pickFresh(hypeH2H, winner, loser);
        punchline = isDraw
          ? "DRAW: Pure fire from both sides. Run it back in the next contest!"
          : pickFresh(hypePunchlines, winner, loser);
        break;
      }

      case "savage_dev":
      default: {
        const leetcodePunchlines = [
          `Winner: @${winner}. Easy solves didn't save @${loser} from an O(N^2) reality check.`,
          `Winner: @${winner}. @${loser} memorized Two Sum 50 times but froze under pressure.`,
          `Winner: @${winner}. @${loser} was reading the hints tab while @${winner} shipped AC.`,
          `Winner: @${winner}. @${loser}'s runtime complexity gave the interviewer second-hand embarrassment.`,
          `Winner: @${winner}. @${loser} ate a 90-minute penalty on Q3 while @${winner} swept.`,
          `Winner: @${winner}. @${loser}'s NeetCode 150 bookmark folder couldn't close a +${margin}-pt gap.`,
          `Winner: @${winner}. @${loser} brought O(2^N) recursion to an O(log N) gunfight.`,
          `Winner: @${winner}. ${winnerScore.total}–${loserScore.total} on the board; @${loser} is back to grinding Easy arrays.`,
          `Winner: @${winner}. @${loser} copy-pasted from the discussion tab and still hit TLE.`,
          `Winner: @${winner}. @${loser} choked the Sunday contest while @${winner} banked the rating.`,
          `Winner: @${winner}. @${loser}'s sliding window slid straight off a cliff.`,
          `Winner: @${winner}. @${loser} needs a DP table just to calculate this +${margin}-pt loss.`,
        ];
        const leetcodeH2H = [
          `@${winner} takes the match ${winnerScore.total}–${loserScore.total}. While both know their two pointers, @${winner}'s problem depth left @${loser} stuck on an O(N^2) brute force.`,
          `Grind culture reality check: @${winner} outclassed @${loser} by +${margin} points. Grinding Easy problems with the editorial open doesn't help when contest pressure hits.`,
          `Algorithm clinic: @${winner} deployed optimal O(N) runtime (${winnerScore.metrics.solvedCount} solves) while @${loser} was desperately trying to invert a binary tree.`,
          `Scoreboard gap exposed: @${winner}'s ${winnerScore.metrics.maxRating} peak rating crushed @${loser}'s ${loserScore.metrics.maxRating} ceiling across all five axes.`,
          `Interview prep post-mortem: @${winner} solved the hard DP state transition while @${loser} burned 45 minutes debugging an off-by-one loop.`,
          `No mercy in the arena: @${winner} posted ${winnerScore.total} composite points while @${loser} (${loserScore.total} pts) was still begging the discussion tab for a Python one-liner.`,
          `Sunday contest receipt: @${winner} cleared Q3 and Q4 with time to spare while @${loser} ate three consecutive wrong-answer penalties on hidden edge cases.`,
          `Technical screening verdict: @${winner} brought real algorithmic grit (${winnerScore.axes.algorithmicGrit}/100) while @${loser} (${loserScore.axes.algorithmicGrit}/100) padded stats on array warmups.`,
        ];
        headToHeadRoast = isDraw
          ? `Algorithmic deadlock. @${p1.handle} and @${p2.handle} both finished at ${p1.total} pts. Two identical submissions, both hitting TLE on the exact same test case.`
          : pickFresh(leetcodeH2H, winner, loser);
        punchline = isDraw
          ? "DRAW: Both survived the test cases. Neither earned the interview offer."
          : pickFresh(leetcodePunchlines, winner, loser);
        break;
      }
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

    const peak = Math.max(p1.metrics.maxRating, p2.metrics.maxRating);

    switch (persona) {
      case "silicon_valley_vc":
        headToHeadRoast = isDraw
          ? `Two identical CodeChef pitch decks tied at ${p1.total} composite points. Zero defensible kitchen moat between @${p1.handle} and @${p2.handle}.`
          : `Term sheet goes to @${winner}. While @${p1.handle} and @${p2.handle} both pitched culinary scale, @${winner}'s ${peak} peak rating shows actual kitchen execution over @${loser}.`;
        punchline = isDraw
          ? "DRAW: Both founders failed the tasting menu. Pivot before the next contest."
          : `Winner: @${winner}. Clear competitive programming moat over @${loser}.`;
        break;

      case "ufc_announcer":
        headToHeadRoast = isDraw
          ? `UNANIMOUS DRAW! Five punishing rounds inside the CodeChef arena between @${p1.handle} and @${p2.handle}, and the judges are completely split at ${p1.total}!`
          : `IT'S ALL OVER! In a grueling 5-round slugfest, @${winner} cooks @${loser} with an unstoppable ${peak} peak rating!`;
        punchline = isDraw
          ? "DRAW: Absolute bloodbath in the kitchen! We need an immediate rematch!"
          : `Winner: @${winner}. Undisputed head chef of the arena over @${loser}!`;
        break;

      case "hype_man":
        headToHeadRoast = isDraw
          ? `YO HOLD UP! @${p1.handle} and @${p2.handle} just served up a dead heat at ${p1.total} points each! Neither coder is giving up ground!`
          : `TURN THE HEAT UP! @${winner} just cooked up an absolute masterclass on the CodeChef scoreboard against @${loser}!`;
        punchline = isDraw
          ? "DRAW: Pure heat from both stations! Run it back in the next Starters!"
          : `Winner: @${winner}. Five-star flavor and total scoreboard dominance over @${loser}!`;
        break;

      case "savage_dev":
      default: {
        const codechefPunchlines = [
          `Winner: @${winner}. Served @${loser} a masterclass; dish duty awaits in Div 4.`,
          `Winner: @${winner}. 10 days on a Long Challenge couldn't save @${loser}.`,
          `Winner: @${winner}. @${loser}'s rating dropped faster than a hot pan in Starters.`,
          `Winner: @${winner}. Chef hat on the profile, but @${loser} burned Problem B.`,
          `Winner: @${winner}. @${loser} got deep-fried by +${margin} points in the kitchen.`,
          `Winner: @${winner}. @${loser} brought a microwave recipe to a Michelin Starters round.`,
          `Winner: @${winner}. ${winnerScore.total}–${loserScore.total}; @${loser} is back on dishwashing duty.`,
          `Winner: @${winner}. @${loser} overcooked a greedy approach into five WA penalties.`,
          `Winner: @${winner}. @${loser}'s rating graph looks like a fallen soufflé.`,
          `Winner: @${winner}. @${loser} gotdemoted to prep cook after that +${margin}-pt rout.`,
        ];
        const codechefH2H = [
          `Cooked to a crisp: @${winner} served @${loser} an absolute masterclass (${winnerScore.total}–${loserScore.total}). While both showed up with chef hats, @${winner}'s rating ceiling (${peak}) left @${loser} washing dishes in Div 4.`,
          `Kitchen disaster for @${loser}: @${winner} brought Michelin-tier problem solving while @${loser} was burning the test cases on basic greedy algorithms.`,
          `Scoreboard demolition: @${winner} served up clean green AC while @${loser} took five consecutive WRONG_ANSWER penalties in Wednesday Starters.`,
          `Culinary gap exposed: @${winner} (+${margin} pts) dominated with ${winnerScore.metrics.solvedCount} solves while @${loser}'s half-baked logic timed out on subtask 2.`,
          `No mercy in the CodeChef kitchen: @${winner} peaked at ${winnerScore.metrics.maxRating} while @${loser} (${loserScore.metrics.maxRating} peak) couldn't handle the heat past Problem B.`,
          `Starters post-mortem: @${winner} plated optimal complexity in 12 minutes while @${loser} spent two hours debugging integer overflow.`,
        ];
        headToHeadRoast = isDraw
          ? `Kitchen deadlock. @${p1.handle} and @${p2.handle} both finished at ${p1.total} pts. Two identical submissions, both burning the test cases on Div 1 problem B.`
          : pickFresh(codechefH2H, winner, loser);
        punchline = isDraw
          ? "DRAW: Both survived the kitchen timer. Neither earned a Michelin star."
          : pickFresh(codechefPunchlines, winner, loser);
        break;
      }
    }
  } else {
    // Codeforces Roaster
    const peak = Math.max(p1.metrics.maxRating, p2.metrics.maxRating);

    player1Roast = pickFresh(
      [
        `@${p1.handle}: Peak of ${p1.metrics.maxRating} with ${p1.metrics.solvedCount} solves, though half of those ACs came after system tests bruised the ego.`,
        `@${p1.handle}: ${p1.metrics.rating} current rating (${p1.metrics.maxRating} peak) and ${p1.metrics.solvedCount} solves—dangerous on math tags, questionable on messy implementation.`,
        `@${p1.handle}: Logged ${p1.metrics.solvedCount} problems across ${p1.metrics.distinctTagsCount} tags, still chasing that next color promotion.`,
      ],
      p1.handle,
      String(p1.total)
    );

    player2Roast = pickFresh(
      [
        `@${p2.handle}: ${p2.metrics.solvedCount} solves across the board, but still getting hacked during the last five minutes of the round.`,
        `@${p2.handle}: Sitting at ${p2.metrics.rating} rating (${p2.metrics.maxRating} peak) with ${p2.metrics.solvedCount} solves—solid speed on A/B, turbulence on C/D.`,
        `@${p2.handle}: ${p2.metrics.solvedCount} accepted solutions on record, yet pretest 2 remains a recurring nemesis.`,
      ],
      p2.handle,
      String(p2.total)
    );

    switch (persona) {
      case "silicon_valley_vc": {
        const vcCfH2H = [
          `Term sheet goes to @${winner}. While @${p1.handle} and @${p2.handle} both pitched algorithmic scale, @${winner}'s ${peak} peak rating shows actual market traction.`,
          `Cap table decision: @${winner} (${winnerScore.total} pts) secured the lead round by +${margin} pts while @${loser}'s rating burn rate spooked the partners.`,
          `Series B locked for @${winner}: ${winnerScore.metrics.solvedCount} verified solves and ${winnerScore.axes.algorithmicGrit}/100 grit crushed @${loser}'s seed-stage metrics.`,
        ];
        const vcCfPunchlines = [
          `Winner: @${winner}. @${loser}'s rating ROI just got down-rounded by +${margin} points.`,
          `Winner: @${winner}. Clear algorithmic moat over @${loser}'s brute-force pitch.`,
          `Winner: @${winner}. @${loser} burned all their contest runway before pretest 4.`,
        ];
        headToHeadRoast = isDraw
          ? `Two identical pitch decks tied at ${p1.total} composite points. Zero defensible moat between @${p1.handle} and @${p2.handle}.`
          : pickFresh(vcCfH2H, winner, loser);
        punchline = isDraw
          ? "DRAW: Down-round for both founders. Pivot before the next contest."
          : pickFresh(vcCfPunchlines, winner, loser);
        break;
      }

      case "ufc_announcer": {
        const ufcCfH2H = [
          `IT'S ALL OVER! In a brutal 5-round slugfest, @${winner} lands the knockout blow (${winnerScore.total}–${loserScore.total}) with an unstoppable ${peak} peak!`,
          `STOP THE FIGHT! @${winner} dominates @${loser} by +${margin} points across every judge's scorecard in the Codeforces Octagon!`,
          `CLINICAL KNOCKOUT! @${winner} combined a ${winnerScore.metrics.maxRating} peak with ${winnerScore.metrics.solvedCount} solves to leave @${loser} out on the canvas!`,
        ];
        const ufcCfPunchlines = [
          `Winner: @${winner}. @${loser} got knocked out on pretest 2 in round one!`,
          `Winner: @${winner}. A +${margin}-point demolition over @${loser} inside the arena!`,
          `Winner: @${winner}. AND STILL the undisputed leaderboard champion over @${loser}!`,
        ];
        headToHeadRoast = isDraw
          ? `UNANIMOUS DRAW! Five punishing rounds between @${p1.handle} and @${p2.handle}, and the judges are completely split at ${p1.total}!`
          : pickFresh(ufcCfH2H, winner, loser);
        punchline = isDraw
          ? "DRAW: An absolute bloodbath. We need an immediate rematch inside the Octagon!"
          : pickFresh(ufcCfPunchlines, winner, loser);
        break;
      }

      case "hype_man": {
        const hypeCfH2H = [
          `TURN THE SPEAKERS UP! @${winner} just dropped a ${winnerScore.total}–${loserScore.total} masterclass on the scoreboard against @${loser}!`,
          `SOUND THE HORNS! @${winner} flexed a ${winnerScore.metrics.maxRating} peak rating and +${margin}-point margin that left @${loser} frozen!`,
          `TERMINAL ON FIRE! @${winner} stacked ${winnerScore.metrics.solvedCount} solves and owned the Codeforces stage from problem A to E!`,
        ];
        const hypeCfPunchlines = [
          `Winner: @${winner}. Green checks and a +${margin}-pt blowout over @${loser}!`,
          `Winner: @${winner}. @${loser} couldn't keep up with that ${winnerScore.metrics.maxRating}-peak pace!`,
          `Winner: @${winner}. Pure contest heat and total dominance over @${loser}!`,
        ];
        headToHeadRoast = isDraw
          ? `YO HOLD UP! @${p1.handle} and @${p2.handle} just locked up at ${p1.total} points each! Nobody's backing down in this terminal!`
          : pickFresh(hypeCfH2H, winner, loser);
        punchline = isDraw
          ? "DRAW: Pure fire from both sides. Run it back next round!"
          : pickFresh(hypeCfPunchlines, winner, loser);
        break;
      }

      case "savage_dev":
      default: {
        const codeforcesPunchlines = [
          `Winner: @${winner}. @${loser} got hacked in the final minutes while @${winner} podiumed.`,
          `Winner: @${winner}. Pretest 2 was a brick wall against @${loser}'s brute force.`,
          `Winner: @${winner}. @${loser} burned 5 WAs while @${winner} took it by +${margin} pts.`,
          `Winner: @${winner}. @${loser} ate a brutal rating drop while @${winner} farmed +${margin} pts.`,
          `Winner: @${winner}. @${loser}'s segment tree had more bugs than the contest server.`,
          `Winner: @${winner}. ${winnerScore.total}–${loserScore.total}; @${loser} failed system tests on Problem B.`,
          `Winner: @${winner}. @${loser}'s ${loserScore.metrics.maxRating} peak couldn't survive @${winner}'s ${winnerScore.metrics.maxRating} ceiling.`,
          `Winner: @${winner}. @${loser} brought an O(N^2) greedy to a Div 1 DP fight.`,
          `Winner: @${winner}. @${loser} is still waiting in the judge queue for a miracle.`,
          `Winner: @${winner}. @${loser} got speed-diffed on A, B, and C before standing a chance.`,
          `Winner: @${winner}. @${loser} spent 90 minutes debugging integer overflow on ` + "`long long`" + `.`,
          `Winner: @${winner}. +${margin} composite points separated @${winner}'s AC from @${loser}'s TLE.`,
        ];
        const codeforcesH2H = [
          `@${winner} takes the match ${winnerScore.total}–${loserScore.total}. While @${p1.handle} and @${p2.handle} both know their segment trees, @${winner}'s rating ceiling (${peak}) left @${loser} stuck on pretest 2.`,
          `Algorithmic execution clinic: @${winner} locked down a +${margin}-point victory (${winnerScore.metrics.solvedCount} solves) while @${loser} was desperately debugging off-by-one edge cases.`,
          `Rating gap exposed: @${winner} (${winnerScore.metrics.maxRating} peak) proved why verified contest peaks matter, leaving @${loser} (${loserScore.metrics.maxRating} peak) with five wrong submissions on problem C.`,
          `System tests showed zero mercy: @${winner} posted ${winnerScore.axes.algorithmicGrit}/100 algorithmic grit while @${loser}'s optimistic greedy heuristic disintegrated on test 47.`,
          `Total scoreboard control: @${winner} combined ${winnerScore.metrics.solvedCount} lifetime solves with a ${winnerScore.metrics.rating} active rating to outpace @${loser} across ${winnerScore.metrics.distinctTagsCount} algorithm tags.`,
          `Speed and depth mismatch: @${winner} cleared the hard problem set with ${winnerScore.total} composite points, while @${loser} (${loserScore.total} pts) burned the clock fighting TLE.`,
          `Contest post-mortem: @${winner} dominated the head-to-head tape by +${margin} points while @${loser}'s submission history looked like a random number generator.`,
          `Levels to this game: @${winner}'s ${winnerScore.axes.contestPeak}/100 peak score and ${winnerScore.axes.solveVolume}/100 volume left @${loser} searching the tutorial blog for hints.`,
        ];
        headToHeadRoast = isDraw
          ? `Algorithmic deadlock. @${p1.handle} and @${p2.handle} both finished at ${p1.total} pts. Two identical submissions, and neither one passed system tests.`
          : pickFresh(codeforcesH2H, winner, loser);
        punchline = isDraw
          ? "DRAW: Both survived system tests. Neither earned the rating bump."
          : pickFresh(codeforcesPunchlines, winner, loser);
        break;
      }
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
