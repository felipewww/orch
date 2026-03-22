import { z } from "zod";

export const intentRefinerOutputSchema = z.object({
    problem: z.string(),
    valueHypothesis: z.string(),
    mainRisk: z.string(),
    needsClarification: z.boolean(),
    // clarifyingQuestions: z.array(z.string()).max(3),
    clarifyingQuestions: z.array(z.string()),
    canAdvance: z.boolean(),
});

export type IntentRefinerOutput = z.infer<typeof intentRefinerOutputSchema>;
