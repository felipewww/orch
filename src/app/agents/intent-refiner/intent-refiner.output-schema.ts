import { z } from "zod";

export const intentRefinerOutputSchema = z.object({
    problem: z.string(),
    valueHypothesis: z.string(),
    mainRisk: z.string(),
    riskLevel: z.enum(["low", "medium", "high", "blocker"]),
    engineeringConcerns: z.array(z.string()),
    needsClarification: z.boolean(),
    clarifyingQuestions: z.array(z.string()),
    canAdvance: z.boolean(),
});

export type IntentRefinerOutput = z.infer<typeof intentRefinerOutputSchema>;
