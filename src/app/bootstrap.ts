import { App } from "@slack/bolt";
import { AntService } from "@/infra/ant.service";
import { TerminalIO } from "@/infra/terminal-io";
import { SlackIO } from "@/infra/slack-io";
import { buildFeatureGraph } from "@/app/graph/feature-graph";

export async function bootstrap() {
    const antService = new AntService();

    if (process.env.SLACK_BOT_TOKEN && process.env.SLACK_APP_TOKEN) {
        console.log('starting slack bot.'.green.bold)
        await bootstrapSlack(antService);
    } else {
        console.log('starting terminal bot.'.green.bold)
        await bootstrapTerminal(antService);
    }
}

async function bootstrapTerminal(antService: AntService) {
    const terminal = new TerminalIO();
    const graph = buildFeatureGraph(antService, terminal);

    try {
        const rawIdea = await terminal.ask("Describe the feature idea");
        const authorRoleRaw = await terminal.ask("Who is proposing this? (c_level / pm / engineer)");
        const strategicContext = await terminal.ask("Optional strategic context (leave blank if none)");

        const result = await graph.invoke({
            rawIdea,
            authorRole: (["c_level", "pm", "engineer"].includes(authorRoleRaw)
                ? authorRoleRaw
                : undefined) as "c_level" | "pm" | "engineer" | undefined,
            strategicContext: strategicContext || undefined,
        });

        terminal.print("\n=== Final Result ===");
        terminal.printJson(result);
    } finally {
        terminal.close();
    }
}

async function bootstrapSlack(antService: AntService) {
    const channelId = process.env.SLACK_CHANNEL_ID!;

    const app = new App({
        token: process.env.SLACK_BOT_TOKEN,
        appToken: process.env.SLACK_APP_TOKEN,
        socketMode: true,
    });

    const slackIO = new SlackIO(app, channelId);

    app.message(async ({ message }) => {
        const msg = message as {
            ts: string;
            thread_ts?: string;
            text?: string;
            bot_id?: string;
            subtype?: string;
            channel: string;
        };

        console.log(msg);

        // Ignore bot messages and subtypes (join, leave, etc.)
        if (msg.bot_id || msg.subtype) return;

        // Only handle messages in the designated channel
        if (msg.channel !== channelId) return;

        // Only handle new thread starters — not replies
        if (msg.thread_ts && msg.thread_ts !== msg.ts) return;

        if (!msg.text) return;

        const threadTs = msg.ts;
        const rawIdea = msg.text;
        const io = slackIO.forThread(threadTs);
        const graph = buildFeatureGraph(antService, io);

        const authorRoleRaw = await io.ask("Who is proposing this? (c_level / pm / engineer)");
        const strategicContext = await io.ask("Optional strategic context (leave blank if none)");

        const result = await graph.invoke({
            rawIdea,
            authorRole: (["c_level", "pm", "engineer"].includes(authorRoleRaw)
                ? authorRoleRaw
                : undefined) as "c_level" | "pm" | "engineer" | undefined,
            strategicContext: strategicContext || undefined,
        });

        await io.print("=== Final Result ===");
        await io.printJson(result);
    });

    await app.start();
    console.log("Slack bot running in socket mode");
}
