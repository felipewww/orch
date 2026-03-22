import { z } from "zod";

export const intentRefinerInputSchema = z.object({
    rawIdea: z.string().min(1),
    authorRole: z.enum(["c_level", "pm", "engineer"]).optional(),
    strategicContext: z.string().optional(),
    humanClarifications: z.array(z.string()).default([]),
});

export type IntentRefinerInput = z.infer<typeof intentRefinerInputSchema>;
