import {AntService} from "@/infra/ant.service";
import {AgentIntentRefiner} from "@/app/agents/intent-refiner/agent.intent-refiner";
import {TerminalIO} from "@/infra/terminal-io";
import {AgentRunner} from "@/app/agents/agent-runner";
import {IntentRefinerInput} from "@/app/agents/intent-refiner/intent-refine.input-schema";

export async function bootstrap() {
    // const antService = new AntService()
    // // const answer = await antService.ask("Explique em 1 frase o que é um agente de IA")
    // // console.log(answer)
    //
    // const intentRefinerAgent = new IntentRefinerAgent(antService);
    //
    // const intentAnswer = await intentRefinerAgent.run(
    //     "Quero que operações consiga exportar qualquer tabela do sistema para CSV"
    // )
    //
    // console.log(intentAnswer);
    const io = new TerminalIO();
    const antService = new AntService();
    const agent = new AgentIntentRefiner(antService);

    try {
        const rawIdea = await io.ask("Descreva a ideia inicial");
        const authorRoleRaw = await io.ask(
            "Quem está propondo isso? (c_level / pm / engineer)",
        );
        const strategicContext = await io.ask(
            "Contexto estratégico opcional (pode deixar vazio)",
        );

        const input: IntentRefinerInput = {
            rawIdea,
            authorRole: ["c_level", "pm", "engineer"].includes(authorRoleRaw)
                ? (authorRoleRaw as "c_level" | "pm" | "engineer")
                : undefined,
            strategicContext: strategicContext || undefined,
            humanClarifications: [],
        };

        const runner = new AgentRunner(
            agent,
            io,
            (currentInput, answers) => ({
                ...currentInput,
                humanClarifications: [
                    ...currentInput.humanClarifications,
                    ...answers,
                ],
            }),
            2,
        );

        const result = await runner.run(input);

        io.print("\n=== Resultado final ===");
        io.printJson(result);
    } finally {
        io.close();
    }
}
