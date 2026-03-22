import {AntService} from "@/infra/ant.service";

export abstract class Agent {
    constructor(
        protected antService: AntService,
    ) {
    }
}
