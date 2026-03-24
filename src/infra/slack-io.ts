import { App } from "@slack/bolt";
import { WebClient } from "@slack/web-api";
import { IO } from "@/infra/io";

export class SlackIO {
    private client: WebClient;
    private pendingReplies = new Map<string, (text: string) => void>();

    constructor(
        private app: App,
        private channelId: string,
    ) {
        this.client = app.client;
        this.app.message(async ({ message }) => {
            const msg = message as { thread_ts?: string; text?: string; bot_id?: string; subtype?: string };
            if (msg.bot_id || msg.subtype) return;
            const threadTs = msg.thread_ts;
            if (!threadTs || !msg.text) return;
            this.handleReply(threadTs, msg.text);
        });
    }

    private handleReply(threadTs: string, text: string) {
        const resolve = this.pendingReplies.get(threadTs);
        if (resolve) {
            this.pendingReplies.delete(threadTs);
            resolve(text);
        }
    }

    async ask(question: string, threadTs: string): Promise<string> {
        await this.client.chat.postMessage({
            channel: this.channelId,
            thread_ts: threadTs,
            text: question,
        });
        return new Promise((resolve) => {
            this.pendingReplies.set(threadTs, resolve);
        });
    }

    async print(message: string, threadTs: string): Promise<void> {
        await this.client.chat.postMessage({
            channel: this.channelId,
            thread_ts: threadTs,
            text: message,
        });
    }

    async printJson(data: unknown, threadTs: string): Promise<void> {
        const text = "```\n" + JSON.stringify(data, null, 2) + "\n```";
        await this.client.chat.postMessage({
            channel: this.channelId,
            thread_ts: threadTs,
            text,
        });
    }

    async confirm(question: string, threadTs: string): Promise<boolean> {
        const answer = await this.ask(`${question} (y/n)`, threadTs);
        return ["y", "yes", "s", "sim"].includes(answer.trim().toLowerCase());
    }

    forThread(threadTs: string): IO {
        return {
            ask: (question) => this.ask(question, threadTs),
            print: (message) => this.print(message, threadTs),
            printJson: (data) => this.printJson(data, threadTs),
            confirm: (question) => this.confirm(question, threadTs),
        };
    }
}
