import {Agent} from "@/app/agents/agent";
import {IntentRefinerOutput, intentRefinerOutputSchema} from "@/app/agents/intent-refiner/intent.schema";

export class IntentRefinerAgent extends Agent {

    async run(input: string) {
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
            Analise a ideia abaixo e transforme em um objeto JSON com os campos:
            
            - problem: qual problema essa ideia parece tentar resolver
            - valueHypothesis: qual valor de negócio ou operacional ela pode gerar
            - mainRisk: principal risco ou ponto de atenção
            - needsClarification: true se faltar contexto importante
            - clarifyingQuestions: até 3 perguntas curtas, apenas se realmente necessário
            - canAdvance: true se já existe informação suficiente para seguir para a próxima etapa mesmo com pequenas incertezas
            
            Ideia:
            """${input}"""
        `;

        return await this.antService.ask(
            prompt,
            system,
            intentRefinerOutputSchema,
        );

    }
}
