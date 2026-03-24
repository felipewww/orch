import { END, START, StateGraph } from "@langchain/langgraph";
import { GraphState, GraphStateType } from "@/app/graph/graph-state";
import { AgentIntentRefiner } from "@/app/agents/intent-refiner/agent.intent-refiner";
import { AgentTechAnalyzer } from "@/app/agents/tech-analyzer/agent.tech-analyzer";
import { AgentRunner } from "@/app/agents/agent-runner";
import { AntService } from "@/infra/ant.service";
import { IO } from "@/infra/io";

const MAX_LOOPS = 2;

export function buildFeatureGraph(antService: AntService, io: IO) {
    const intentRefinerAgent = new AgentIntentRefiner(antService);
    const techAnalyzerAgent = new AgentTechAnalyzer(antService);

    async function intentRefinerNode(state: GraphStateType): Promise<Partial<GraphStateType>> {
        const runner = new AgentRunner(
            intentRefinerAgent,
            io,
            (input, answers) => ({
                ...input,
                humanClarifications: [...input.humanClarifications, ...answers],
            }),
        );

        const result = await runner.run({
            rawIdea: state.rawIdea,
            authorRole: state.authorRole,
            strategicContext: state.strategicContext,
            humanClarifications: [
                ...state.pmClarifications,
                ...state.productRevisionContext,
            ],
        });

        return {
            refinedIntent: result,
            pmClarifications: result.clarifyingQuestions.length > 0 ? [] : [],
        };
    }

    async function techAnalyzerNode(state: GraphStateType): Promise<Partial<GraphStateType>> {
        if (!state.refinedIntent) {
            throw new Error("techAnalyzerNode: refinedIntent is missing from state");
        }

        const runner = new AgentRunner(
            techAnalyzerAgent,
            io,
            (input, answers) => ({
                ...input,
                devClarifications: [...input.devClarifications, ...answers],
            }),
        );

        const result = await runner.run({
            refinedIntent: state.refinedIntent.problem,
            engineeringConcerns: state.refinedIntent.engineeringConcerns,
            devClarifications: state.devClarifications,
            productRevisionContext: state.productRevisionContext,
        });

        const newProductRevisionContext = result.requiresProductRevision
            ? result.productRevisionQuestions
            : [];

        return {
            techAssessment: result,
            productRevisionContext: newProductRevisionContext,
            loopCount: state.loopCount + 1,
        };
    }

    function router(state: GraphStateType): string {
        const { techAssessment, loopCount } = state;
        if (techAssessment?.requiresProductRevision && loopCount < MAX_LOOPS) {
            return "intent_refiner";
        }
        return "__end__";
    }

    return new StateGraph(GraphState)
        .addNode("intent_refiner", intentRefinerNode)
        .addNode("tech_analyzer", techAnalyzerNode)
        .addEdge(START, "intent_refiner")
        .addEdge("intent_refiner", "tech_analyzer")
        .addConditionalEdges("tech_analyzer", router, {
            intent_refiner: "intent_refiner",
            __end__: END,
        })
        .compile();
}
