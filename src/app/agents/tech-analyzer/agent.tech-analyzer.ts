import { loadPrompt } from "@/infra/prompt-loader";
import { BaseAgent } from "@/app/agents/base-agent";
import { TechAnalyzerInput, techAnalyzerInputSchema } from "@/app/agents/tech-analyzer/tech-analyzer.input-schema";
import { TechAnalyzerOutput, techAnalyzerOutputSchema } from "@/app/agents/tech-analyzer/tech-analyzer.output-schema";

const companyContext = loadPrompt("prompts/company.md");
const agentSystem = loadPrompt("prompts/agents/tech-analyzer/system.md");
const system = `${companyContext}\n\n---\n\n${agentSystem}`;

export class AgentTechAnalyzer extends BaseAgent<TechAnalyzerInput, TechAnalyzerOutput> {
    name = "TechAnalyzerAgent";

    async run(input: TechAnalyzerInput) {
        const validInput = techAnalyzerInputSchema.parse(input);

        const prompt = `
            Analise a intenção refinada abaixo do ponto de vista técnico.

            Retorne:
            - technicalAssessment (avaliação técnica geral)
            - taskBreakdown (lista de tarefas para implementação)
            - riskLevel (low | medium | high | blocker)
            - requiresProductRevision (true se uma decisão de produto precisa ser revisada)
            - productRevisionQuestions (perguntas para o PM caso requiresProductRevision = true)
            - needsClarification
            - clarifyingQuestions (dúvidas técnicas para o desenvolvedor)
            - canAdvance

            Intenção refinada:
            ${validInput.refinedIntent}

            Preocupações de engenharia identificadas:
            ${
                validInput.engineeringConcerns.length > 0
                    ? validInput.engineeringConcerns.map((c, i) => `${i + 1}. ${c}`).join("\n")
                    : "nenhuma"
            }

            Esclarecimentos do desenvolvedor já recebidos:
            ${
                validInput.devClarifications.length > 0
                    ? validInput.devClarifications.map((v, i) => `${i + 1}. ${v}`).join("\n")
                    : "nenhum"
            }

            Contexto de revisão de produto (feedback anterior do agente técnico):
            ${
                validInput.productRevisionContext.length > 0
                    ? validInput.productRevisionContext.map((v, i) => `${i + 1}. ${v}`).join("\n")
                    : "nenhum"
            }
        `;

        return await this.antService.ask(prompt, system, techAnalyzerOutputSchema);
    }
}
