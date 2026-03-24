import { Annotation } from "@langchain/langgraph";
import { IntentRefinerOutput } from "@/app/agents/intent-refiner/intent-refiner.output-schema";
import { TechAnalyzerOutput } from "@/app/agents/tech-analyzer/tech-analyzer.output-schema";

export const GraphState = Annotation.Root({
    rawIdea: Annotation<string>,
    authorRole: Annotation<"c_level" | "pm" | "engineer" | undefined>,
    strategicContext: Annotation<string | undefined>,

    pmClarifications: Annotation<string[]>({
        reducer: (a, b) => [...a, ...b],
        default: () => [],
    }),
    devClarifications: Annotation<string[]>({
        reducer: (a, b) => [...a, ...b],
        default: () => [],
    }),
    productRevisionContext: Annotation<string[]>({
        reducer: (a, b) => [...a, ...b],
        default: () => [],
    }),

    refinedIntent: Annotation<IntentRefinerOutput | undefined>,
    techAssessment: Annotation<TechAnalyzerOutput | undefined>,

    loopCount: Annotation<number>({
        reducer: (_, b) => b,
        default: () => 0,
    }),
});

export type GraphStateType = typeof GraphState.State;
