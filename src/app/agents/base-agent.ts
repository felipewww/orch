import {AntService} from "@/infra/ant.service";
import {RefinableAgentOutput} from "@/app/agents/refinable-agent-output";

export abstract class BaseAgent<I, O extends RefinableAgentOutput> {
    abstract name: string;
    abstract run(input: I): Promise<O>;

    constructor(
        protected antService: AntService,
    ) {
    }
}
