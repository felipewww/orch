import {BaseAgent} from "@/app/agents/base-agent";
import {IntentRefinerOutput, intentRefinerOutputSchema} from "@/app/agents/intent-refiner/intent-refiner.output-schema";
import {IntentRefinerInput, intentRefinerInputSchema} from "@/app/agents/intent-refiner/intent-refine.input-schema";

export class AgentIntentRefiner extends BaseAgent<IntentRefinerInput, IntentRefinerOutput> {
    name = 'IntentRefinerAgent';

    async run(input: IntentRefinerInput) {
        const validInput = intentRefinerInputSchema.parse(input);

        const system = `
            Você é um especialista em produto e discovery.
            Seu papel é transformar uma ideia bruta em um resumo claro e curto.
            Não invente contexto não fornecido.
            Se houver ambiguidade, marque isso explicitamente.

           Responda APENAS com JSON válido.
            NÃO use:
            - markdown
            - \`\`\`json
            - explicações
        `;

        const prompt = `
            Analise a ideia abaixo.
            
            Retorne:
            - problem
            - valueHypothesis
            - mainRisk
            - needsClarification
            - clarifyingQuestions
            - canAdvance
            
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
