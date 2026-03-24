import {RefinableAgentOutput} from "@/app/agents/refinable-agent-output";
import {TerminalIO} from "@/infra/terminal-io";
import {BaseAgent} from "@/app/agents/base-agent";

export class AgentRunner<I, O extends RefinableAgentOutput> {
    constructor(
        private agent: BaseAgent<I, O>,
        private io: TerminalIO,
        private mergeInput: (input: I, humanAnswers: string[]) => I,
        private maxRounds = 2,
    ) {}

    async run(initialInput: I): Promise<O> {
        let currentInput = initialInput;

        for (let round = 0; round <= this.maxRounds; round++) {
            const result = await this.agent.run(currentInput);

            this.io.print(`\n=== ${this.agent.name} output ===`);
            this.io.printJson(result);

            const hasQuestions =
                result.needsClarification &&
                Array.isArray(result.clarifyingQuestions) &&
                result.clarifyingQuestions.length > 0;

            // Round 0: mandatory clarification if agent flagged it — canAdvance is ignored
            if (round === 0 && result.needsClarification) {
                if (!hasQuestions) return result;
                const answers = await this.collectAnswers(result.clarifyingQuestions);
                currentInput = this.mergeInput(currentInput, answers);
                continue;
            }

            // Round 1+: user decides when canAdvance = true
            if (result.canAdvance) {
                if (!hasQuestions) return result;
                const wantsToAnswer = await this.io.confirm(
                    "There are still open questions. Answer them before advancing?",
                );
                if (!wantsToAnswer) return result;
                const answers = await this.collectAnswers(result.clarifyingQuestions, true);
                currentInput = this.mergeInput(currentInput, answers);
                const shouldAdvance = await this.io.confirm("Advance to the next agent?");
                if (shouldAdvance) return result;
                continue;
            }

            // canAdvance = false
            if (!hasQuestions || round === this.maxRounds) {
                this.io.print("\nRefinement limit reached. Advancing with explicit uncertainty.");
                return result;
            }

            const answers = await this.collectAnswers(result.clarifyingQuestions);
            currentInput = this.mergeInput(currentInput, answers);
        }

        throw new Error("Flow ended without result.");
    }

    private async collectAnswers(questions: string[], allowSkip = false): Promise<string[]> {
        const answers: string[] = [];
        for (const question of questions) {
            const hint = allowSkip ? " (press Enter to skip)" : "";
            const answer = await this.io.ask(`${question}${hint}`);
            answers.push(answer);
        }
        return answers;
    }
}
