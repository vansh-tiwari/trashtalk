import { GoogleGenerativeAI } from "@google/generative-ai";
import { BattleVerdict } from "../battle/types";
import { LeetcodeEvidence, Platform, PlatformEvidence } from "../platforms/contracts";
import { generateLocalCommentary } from "./local-roaster";
import { PERSONA_DEFINITIONS, PROMPT_VERSION } from "./personas";
import { CommentaryResult, CommentaryResultSchema, RoastPersona } from "./schemas";

export interface CommentaryRequest {
  p1Evidence: PlatformEvidence;
  p2Evidence: PlatformEvidence;
  verdict: BattleVerdict;
  persona: RoastPersona;
  platform?: Platform;
  apiKey?: string;
  modelName?: string;
}

export async function generateCommentary({
  p1Evidence,
  p2Evidence,
  verdict,
  persona,
  platform,
  apiKey,
  modelName,
}: CommentaryRequest): Promise<CommentaryResult> {
  const key = apiKey || process.env.GEMINI_API_KEY;
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

  // Local-First Default: If no API key is provided, return deterministic local commentary immediately
  if (!key) {
    return generateLocalCommentary({
      p1Evidence,
      p2Evidence,
      verdict,
      persona,
      platform: isGithub ? "github" : isLeetcode ? "leetcode" : isCodechef ? "codechef" : "codeforces",
    });
  }

  const personaDef = PERSONA_DEFINITIONS[persona] || PERSONA_DEFINITIONS.savage_dev;
  const modelToUse = modelName || process.env.GEMINI_MODEL || "gemini-2.5-flash";

  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({
      model: modelToUse,
      generationConfig: {
        maxOutputTokens: 350,
        temperature: 0.7,
      },
    });

    const isDraw = verdict.outcome === "draw";
    const winnerText = isDraw ? "DRAW (No winner)" : `Winner: @${verdict.winnerHandle}`;
    const platformFlavor = isGithub
      ? "Platform: GitHub (focus on open-source repositories, real stars vs 0-star graveyards, followers, commit cadence, and tech stacks)."
      : isLeetcode
      ? "Platform: LeetCode (focus on interview prep, easy/med/hard solves, Guardian/Knight ranks, contest rankings, time complexity)."
      : isCodechef
      ? "Platform: CodeChef (focus on star ratings 1★-7★, divisions Div 1-4, Starters/Cook-Off/Lunchtime/Long Challenge, chef hats, and kitchen roasting puns)."
      : "Platform: Codeforces (focus on rating pedigree, contest peaks, algorithmic grit, and speed).";

    const compactPrompt = `
Showdown Evidence:
- ${platformFlavor}
- Player 1: @${verdict.player1Score.handle} (Rating: ${verdict.player1Score.metrics.rating}, Peak: ${verdict.player1Score.metrics.maxRating}, Solved: ${verdict.player1Score.metrics.solvedCount})
- Player 2: @${verdict.player2Score.handle} (Rating: ${verdict.player2Score.metrics.rating}, Peak: ${verdict.player2Score.metrics.maxRating}, Solved: ${verdict.player2Score.metrics.solvedCount})
- LOCKED VERDICT: ${winnerText}. Margin: ${verdict.margin} pts. Reason: ${verdict.reasoning}

Task: Write a concise, humorous commentary matching your persona.
Respond ONLY with a valid JSON object matching this schema:
{
  "headToHeadRoast": "paragraph comparing both players",
  "player1Roast": "short direct line targeting Player 1",
  "player2Roast": "short direct line targeting Player 2",
  "punchline": "punchy concluding victory or draw line"
}
Do not wrap in markdown quotes. Return raw JSON.
`;

    // 3-second timeout deadline with clean timer disposal to ensure responsive user experience
    let timeoutId: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error("AI generation timeout exceeded 3000ms")), 3000);
    });

    const callPromise = model.generateContent([
      { text: personaDef.systemInstruction },
      { text: compactPrompt },
    ]);

    let text = "";
    try {
      const result = await Promise.race([callPromise, timeoutPromise]);
      text = result.response.text().trim();
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }

    const cleanJson = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    const parsed = JSON.parse(cleanJson);

    // Contradiction detection: check if generated text falsely proclaims the loser as winner or declares a winner in a draw
    if (!isDraw && verdict.loserHandle) {
      const loser = verdict.loserHandle.toLowerCase();
      const punchlineLower = (parsed.punchline || "").toLowerCase();
      const h2hLower = (parsed.headToHeadRoast || "").toLowerCase();

      const indicatesLoserVictory =
        punchlineLower.includes(`winner: @${loser}`) ||
        punchlineLower.includes(`winner: ${loser}`) ||
        punchlineLower.includes(`@${loser} wins`) ||
        punchlineLower.includes(`${loser} wins`) ||
        punchlineLower.includes(`${loser} takes the crown`) ||
        h2hLower.includes(`winner: @${loser}`) ||
        h2hLower.includes(`@${loser} is the winner`);

      if (indicatesLoserVictory) {
        console.warn("AI generated prose contradicts deterministic verdict. Falling back to local commentary.");
        return generateLocalCommentary({ p1Evidence, p2Evidence, verdict, persona });
      }
    } else if (isDraw) {
      const punchlineLower = (parsed.punchline || "").toLowerCase();
      if (punchlineLower.startsWith("winner:")) {
        console.warn("AI generated winner in a draw match. Falling back to local commentary.");
        return generateLocalCommentary({ p1Evidence, p2Evidence, verdict, persona });
      }
    }

    // Authoritative punchline locked to deterministic result
    const cleanPunchline = (parsed.punchline || "").replace(/^Winner:\s*@[a-zA-Z0-9_-]+\.?\s*/i, "");
    const authoritativePunchline = isDraw
      ? (parsed.punchline || "DRAW: An evenly matched clash of coding titans.")
      : `Winner: @${verdict.winnerHandle}. ${cleanPunchline}`;

    // Validate structured output
    const validated = CommentaryResultSchema.parse({
      source: "ai",
      persona,
      headToHeadRoast: parsed.headToHeadRoast,
      player1Roast: parsed.player1Roast,
      player2Roast: parsed.player2Roast,
      punchline: authoritativePunchline,
      winnerHandle: isDraw ? null : verdict.winnerHandle,
      promptVersion: PROMPT_VERSION,
    });

    return validated;
  } catch (err) {
    // Graceful, automatic fallback to local template roaster on timeout, rate-limit, or schema error
    console.warn("AI commentary unavailable or failed, falling back to local roaster:", err);
    return generateLocalCommentary({ p1Evidence, p2Evidence, verdict, persona });
  }
}
