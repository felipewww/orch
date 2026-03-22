import {AntService} from "@/app/ant.service";

export async function bootstrap() {
    const antService = new AntService()
    const answer = await antService.ask("Explique em 1 frase o que é um agente de IA")

    console.log(answer)
}
