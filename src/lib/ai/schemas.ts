import { z } from "zod";

export const RoastPersonaEnum = z.enum([
  "savage_dev",
  "silicon_valley_vc",
  "ufc_announcer",
  "hype_man",
]);

export type RoastPersona = z.infer<typeof RoastPersonaEnum>;

export const CommentaryResultSchema = z.object({
  source: z.enum(["ai", "local"]),
  persona: RoastPersonaEnum,
  headToHeadRoast: z.string().min(10).max(1000),
  player1Roast: z.string().min(10).max(600),
  player2Roast: z.string().min(10).max(600),
  punchline: z.string().min(5).max(300),
  winnerHandle: z.string().nullable(),
  promptVersion: z.string(),
});

export type CommentaryResult = z.infer<typeof CommentaryResultSchema>;
