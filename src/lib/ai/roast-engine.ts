import { GoogleGenerativeAI } from "@google/generative-ai";
import { BattleVerdict } from "../battle/types";
import { LeetcodeEvidence, Platform, PlatformEvidence } from "../platforms/contracts";
import { generateLocalCommentary } from "./local-roaster";
import { PERSONA_DEFINITIONS, PROMPT_VERSION } from "./personas";
import { CommentaryResult, CommentaryResultSchema, RoastPersona } from "./schemas";
import { GlobalRegionInfo } from "./global-regions";

export interface CommentaryRequest {
  p1Evidence: PlatformEvidence;
  p2Evidence: PlatformEvidence;
  verdict: BattleVerdict;
  persona: RoastPersona;
  platform?: Platform;
  apiKey?: string;
  modelName?: string;
  regionInfo?: GlobalRegionInfo;
}

export async function generateCommentary({
  p1Evidence,
  p2Evidence,
  verdict,
  persona,
  platform,
  apiKey,
  modelName,
  regionInfo,
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
      regionInfo,
    });
  }

  const personaDef = PERSONA_DEFINITIONS[persona] || PERSONA_DEFINITIONS.savage_dev;
  const configuredModel = modelName || process.env.GEMINI_MODEL;
  const candidateModels = Array.from(
    new Set(
      [configuredModel, "gemini-3.8-flash", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"].filter(
        (m): m is string => Boolean(m)
      )
    )
  );

  try {
    const genAI = new GoogleGenerativeAI(key);

    const isDraw = verdict.outcome === "draw";
    const winnerText = isDraw ? "DRAW (No winner)" : `Winner: @${verdict.winnerHandle}`;
    const platformFlavor = isGithub
      ? "Platform: GitHub (focus on open-source repositories, real stars vs 0-star graveyards, followers, commit cadence, and tech stacks)."
      : isLeetcode
      ? "Platform: LeetCode (focus on interview prep, easy/med/hard solves, Guardian/Knight ranks, contest rankings, time complexity)."
      : isCodechef
      ? "Platform: CodeChef (focus on star ratings 1★-7★, divisions Div 1-4, Starters/Cook-Off/Lunchtime/Long Challenge, chef hats, and kitchen roasting puns)."
      : "Platform: Codeforces (focus on rating pedigree, contest peaks, algorithmic grit, and speed).";

    const languageDirective =
      regionInfo && !regionInfo.isEnglishDefault
        ? `
CRITICAL LANGUAGE & CULTURAL REQUIREMENT:
- You MUST write all fields of the JSON in ${regionInfo.languageName} using native informal developer slang!
- Cultural Guide: ${regionInfo.culturalPromptGuidance}
- Punchline must also be in ${regionInfo.languageName}.
`
        : `
CRITICAL TONE REQUIREMENT:
- Razor-sharp Sarcastic Senior Dev English.
- BANNED: Corporate praise like "respectable", "clean AC", "solid effort", "clear market fit".
- Attack dev vanity: 0-star repos, Two-Sum memorization, commit padding, hardstuck cyan, editorial tab open.
`;

    const compactPrompt = `
Showdown Evidence:
- ${platformFlavor}
- Player 1: @${verdict.player1Score.handle} (Rating: ${verdict.player1Score.metrics.rating}, Peak: ${verdict.player1Score.metrics.maxRating}, Solved: ${verdict.player1Score.metrics.solvedCount})
- Player 2: @${verdict.player2Score.handle} (Rating: ${verdict.player2Score.metrics.rating}, Peak: ${verdict.player2Score.metrics.maxRating}, Solved: ${verdict.player2Score.metrics.solvedCount})
- LOCKED VERDICT: ${winnerText}. Margin: ${verdict.margin} pts. Reason: ${verdict.reasoning}
${languageDirective}
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

    let text = "";
    let lastError: unknown = null;

    for (const candidateModel of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: candidateModel,
          generationConfig: {
            maxOutputTokens: 350,
            temperature: 0.7,
          },
        });

        // 3.5-second timeout deadline with clean timer disposal to ensure responsive user experience
        let timeoutId: NodeJS.Timeout | undefined;
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => reject(new Error(`AI generation timeout on ${candidateModel}`)), 3500);
        });

        const callPromise = model.generateContent([
          { text: personaDef.systemInstruction },
          { text: compactPrompt },
        ]);

        try {
          const result = await Promise.race([callPromise, timeoutPromise]);
          text = result.response.text().trim();
          if (text) break;
        } finally {
          if (timeoutId) clearTimeout(timeoutId);
        }
      } catch (err: unknown) {
        lastError = err;
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("404") || msg.includes("not found") || msg.includes("no longer available")) {
          console.warn(`Model ${candidateModel} unavailable (${msg}). Trying next fallback model...`);
          continue;
        }
        throw err;
      }
    }

    if (!text) {
      throw lastError || new Error("Failed to generate content with available Gemini models");
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
        return generateLocalCommentary({
          p1Evidence,
          p2Evidence,
          verdict,
          persona,
          platform: isGithub ? "github" : isLeetcode ? "leetcode" : isCodechef ? "codechef" : "codeforces",
          regionInfo,
        });
      }
    } else if (isDraw) {
      const punchlineLower = (parsed.punchline || "").toLowerCase();
      if (punchlineLower.startsWith("winner:")) {
        console.warn("AI generated winner in a draw match. Falling back to local commentary.");
        return generateLocalCommentary({
          p1Evidence,
          p2Evidence,
          verdict,
          persona,
          platform: isGithub ? "github" : isLeetcode ? "leetcode" : isCodechef ? "codechef" : "codeforces",
          regionInfo,
        });
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
    return generateLocalCommentary({
      p1Evidence,
      p2Evidence,
      verdict,
      persona,
      platform: isGithub ? "github" : isLeetcode ? "leetcode" : isCodechef ? "codechef" : "codeforces",
      regionInfo,
    });
  }
}
