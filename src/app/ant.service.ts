import Anthropic from "@anthropic-ai/sdk";

export class AntService {
    private client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
    });

    async ask(prompt: string) {
        const res = await this.client.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 1000,
            messages: [

                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        return res.content[0];
    }
}
