import {Agent} from "node:http";
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

            if (result.canAdvance) {
                return result;
            }

            const hasQuestions =
                result.needsClarification &&
                Array.isArray(result.clarifyingQuestions) &&
                result.clarifyingQuestions.length > 0;

            if (!hasQuestions || round === this.maxRounds) {
                this.io.print(
                    "\nLimite de refinamento atingido. Avançando com incerteza explícita ou encerrando esta etapa.",
                );
                return result;
            }

            const answers: string[] = [];

            for (const question of result.clarifyingQuestions) {
                const answer = await this.io.ask(question);
                answers.push(answer);
            }

            currentInput = this.mergeInput(currentInput, answers);
        }

        throw new Error("Fluxo encerrou sem resultado.");
    }
}
