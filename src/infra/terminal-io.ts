import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

export class TerminalIO {
    private rl = readline.createInterface({ input, output });

    async ask(question: string): Promise<string> {
        const answer = await this.rl.question(`${question}\n> `);
        return answer.trim();
    }

    print(message: string) {
        console.log(message);
    }

    printJson(data: unknown) {
        console.log(JSON.stringify(data, null, 2));
    }

    async confirm(question: string): Promise<boolean> {
        const answer = await this.ask(`${question} (y/n)`);
        return ["y", "yes", "s", "sim"].includes(answer.toLowerCase());
    }

    close() {
        this.rl.close();
    }
}
