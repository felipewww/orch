import {AntService} from "@/infra/ant.service";
import {IntentRefinerAgent} from "@/app/agents/intent-refiner/intent-refiner.agent";

export async function bootstrap() {
    const antService = new AntService()
    // const answer = await antService.ask("Explique em 1 frase o que é um agente de IA")
    // console.log(answer)

    const intentRefinerAgent = new IntentRefinerAgent(antService);

    const intentAnswer = await intentRefinerAgent.run(
        "Quero que operações consiga exportar qualquer tabela do sistema para CSV"
    )

    console.log(intentAnswer);
}
