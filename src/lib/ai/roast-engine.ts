import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import { BattleVerdict } from "../battle/types";
import { Platform, PlatformEvidence } from "../platforms/contracts";
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

const ROAST_ANGLES = [
  "Focus on contest choke under timer pressure vs padding easy practice problems.",
  "Focus on algorithmic complexity sins (O(N^2) brute force, TLE on pretest 2, memory limits).",
  "Focus on the gap between peak rating pedigree and volume grinding.",
  "Focus on submission hygiene, wrong-answer penalties, and editorial tab dependency.",
  "Focus on comfort-zone problem tags vs real high-difficulty algorithmic grit.",
  "Focus on ego vs actual scoreboard receipts when the round goes live.",
  "Focus on velocity and recent form vs dusty historical achievements.",
  "Focus on shipping real code/solutions vs tutorial cloning and surface-level metrics.",
];

function boundPunchlineText(raw: string): string {
  let cleaned = raw.trim().replace(/^["'“”]+|["'“”]+$/g, "").trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length > 21) {
    cleaned = words.slice(0, 20).join(" ").replace(/[,;:-]+$/, "") + ".";
  }
  if (Array.from(cleaned).length > 145) {
    cleaned = Array.from(cleaned).slice(0, 140).join("").trim() + "…";
  }
  return cleaned;
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
  const rawKey = apiKey !== undefined ? apiKey : process.env.GEMINI_API_KEY;
  const key =
    rawKey &&
    rawKey.trim() !== "" &&
    rawKey.trim() !== "MY_GEMINI_API_KEY" &&
    rawKey.trim() !== "dummy-test-key"
      ? rawKey.trim()
      : "";

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

  const targetPlatform: Platform = isGithub
    ? "github"
    : isLeetcode
    ? "leetcode"
    : isCodechef
    ? "codechef"
    : "codeforces";

  // Local-First Default: If no valid API key is provided, return dynamic local commentary immediately
  if (!key) {
    return generateLocalCommentary({
      p1Evidence,
      p2Evidence,
      verdict,
      persona,
      platform: targetPlatform,
      regionInfo,
    });
  }

  const personaDef = PERSONA_DEFINITIONS[persona] || PERSONA_DEFINITIONS.savage_dev;
  const configuredModel = modelName || process.env.GEMINI_MODEL;
  const candidateModels = Array.from(
    new Set(
      [configuredModel, "gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"].filter(
        (m): m is string => Boolean(m)
      )
    )
  );

  try {
    const ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
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

    const randomAngle = ROAST_ANGLES[Math.floor(Math.random() * ROAST_ANGLES.length)];
    const variationSeed = Math.floor(Math.random() * 100000);

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
Showdown Evidence (Variation Seed #${variationSeed}):
- ${platformFlavor}
- Creative Angle: ${randomAngle}
- Player 1: @${verdict.player1Score.handle} (Composite Score: ${verdict.player1Score.total}/100, Rating: ${verdict.player1Score.metrics.rating}, Peak: ${verdict.player1Score.metrics.maxRating}, Solved: ${verdict.player1Score.metrics.solvedCount}, Velocity: ${verdict.player1Score.axes.recentVelocity}/100, Breadth: ${verdict.player1Score.axes.topicBreadth}/100)
- Player 2: @${verdict.player2Score.handle} (Composite Score: ${verdict.player2Score.total}/100, Rating: ${verdict.player2Score.metrics.rating}, Peak: ${verdict.player2Score.metrics.maxRating}, Solved: ${verdict.player2Score.metrics.solvedCount}, Velocity: ${verdict.player2Score.axes.recentVelocity}/100, Breadth: ${verdict.player2Score.axes.topicBreadth}/100)
- LOCKED VERDICT: ${winnerText}. Margin: ${verdict.margin} pts. Reason: ${verdict.reasoning}
${languageDirective}
Task: Write a fresh, original, humorous commentary matching your persona. Never reuse generic cliché lines.
CRITICAL LENGTH RULE FOR "punchline": Must be a single brutal sentence between 8 and 18 words (strictly under 130 characters) targeting the loser by handle.
`;

    let text = "";

    for (const candidateModel of candidateModels) {
      try {
        let timeoutId: NodeJS.Timeout | undefined;
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(
            () => reject(new Error(`AI generation timeout on ${candidateModel}`)),
            4500
          );
        });

        const callPromise = ai.models.generateContent({
          model: candidateModel,
          contents: compactPrompt,
          config: {
            systemInstruction: personaDef.systemInstruction,
            responseMimeType: "application/json",
            thinkingConfig:
              candidateModel.startsWith("gemini-3.8") || candidateModel.startsWith("gemini-4")
                ? { thinkingLevel: ThinkingLevel.LOW }
                : undefined,
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                headToHeadRoast: {
                  type: Type.STRING,
                  description: "2-3 sharp sentences comparing both players using their actual numbers",
                },
                player1Roast: {
                  type: Type.STRING,
                  description: "Short direct line targeting Player 1",
                },
                player2Roast: {
                  type: Type.STRING,
                  description: "Short direct line targeting Player 2",
                },
                punchline: {
                  type: Type.STRING,
                  description: "Short brutal 8-18 word concluding victory or draw line",
                },
              },
              required: ["headToHeadRoast", "player1Roast", "player2Roast", "punchline"],
            },
          },
        });

        try {
          const result = await Promise.race([callPromise, timeoutPromise]);
          text = (result.text ?? "").trim();
          if (text) break;
        } finally {
          if (timeoutId) clearTimeout(timeoutId);
        }
      } catch {
        continue;
      }
    }

    if (!text) {
      return generateLocalCommentary({
        p1Evidence,
        p2Evidence,
        verdict,
        persona,
        platform: targetPlatform,
        regionInfo,
      });
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
        return generateLocalCommentary({
          p1Evidence,
          p2Evidence,
          verdict,
          persona,
          platform: targetPlatform,
          regionInfo,
        });
      }
    } else if (isDraw) {
      const punchlineLower = (parsed.punchline || "").toLowerCase();
      if (punchlineLower.startsWith("winner:")) {
        return generateLocalCommentary({
          p1Evidence,
          p2Evidence,
          verdict,
          persona,
          platform: targetPlatform,
          regionInfo,
        });
      }
    }

    // Authoritative punchline locked to deterministic result and bounded for selectShortRoast
    const strippedPunchline = (parsed.punchline || "").replace(/^Winner:\s*@[a-zA-Z0-9_.-]+\.?\s*/i, "");
    const cleanPunchline = boundPunchlineText(strippedPunchline);
    const authoritativePunchline = isDraw
      ? cleanPunchline.toUpperCase().startsWith("DRAW")
        ? cleanPunchline
        : `DRAW: ${cleanPunchline || "An evenly matched clash of coding titans."}`
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
  } catch {
    // Graceful, automatic fallback to local template roaster on timeout, rate-limit, or schema error
    return generateLocalCommentary({
      p1Evidence,
      p2Evidence,
      verdict,
      persona,
      platform: targetPlatform,
      regionInfo,
    });
  }
}
