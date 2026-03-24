import {BaseAgent} from "@/app/agents/base-agent";
import {IntentRefinerOutput, intentRefinerOutputSchema} from "@/app/agents/intent-refiner/intent-refiner.output-schema";
import {IntentRefinerInput, intentRefinerInputSchema} from "@/app/agents/intent-refiner/intent-refine.input-schema";
import {loadPrompt} from "@/infra/prompt-loader";

const companyContext = loadPrompt("prompts/company.md");
const agentSystem = loadPrompt("prompts/agents/intent-refiner/system.md");
const system = `${companyContext}\n\n---\n\n${agentSystem}`;

export class AgentIntentRefiner extends BaseAgent<IntentRefinerInput, IntentRefinerOutput> {
    name = 'IntentRefinerAgent';

    async run(input: IntentRefinerInput) {
        const validInput = intentRefinerInputSchema.parse(input);

        const prompt = `
            Analise a ideia abaixo.

            Retorne:
            - problem
            - valueHypothesis
            - mainRisk
            - riskLevel (low | medium | high | blocker)
            - engineeringConcerns (problemas técnicos que o autor provavelmente não percebeu)
            - needsClarification
            - clarifyingQuestions
            - canAdvance

            Se houver esclarecimentos humanos, reavalie os riscos com base na abordagem escolhida.

            Ideia:
            ${validInput.rawIdea}

            Autor:
            ${validInput.authorRole ?? "desconhecido"}

            Contexto estratégico:
            ${validInput.strategicContext ?? "não informado"}

            Esclarecimentos humanos já recebidos:
            ${
                validInput.humanClarifications.length > 0
                    ? validInput.humanClarifications.map((v, i) => `${i + 1}. ${v}`).join("\n")
                    : "nenhum"
            }
        `;

        return await this.antService.ask(
            prompt,
            system,
            intentRefinerOutputSchema,
        );

    }
}
