import { z } from "zod";

export const techAnalyzerOutputSchema = z.object({
    technicalAssessment: z.string(),
    taskBreakdown: z.array(z.string()),
    riskLevel: z.enum(["low", "medium", "high", "blocker"]),
    requiresProductRevision: z.boolean(),
    productRevisionQuestions: z.array(z.string()),
    needsClarification: z.boolean(),
    clarifyingQuestions: z.array(z.string()),
    canAdvance: z.boolean(),
});

export type TechAnalyzerOutput = z.infer<typeof techAnalyzerOutputSchema>;
