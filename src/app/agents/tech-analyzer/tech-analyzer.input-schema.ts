import { z } from "zod";

export const techAnalyzerInputSchema = z.object({
    refinedIntent: z.string().min(1),
    engineeringConcerns: z.array(z.string()).default([]),
    devClarifications: z.array(z.string()).default([]),
    productRevisionContext: z.array(z.string()).default([]),
});

export type TechAnalyzerInput = z.infer<typeof techAnalyzerInputSchema>;
