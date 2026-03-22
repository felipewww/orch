import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

/**
 * The API rejects maxItems in array schemas. This comes from z.array(z.string()).max(3) in intent.schema.ts
 * Zod converts .max(3) to maxItems: 3 in the JSON schema, but Anthropic doesn't support that property.
 */
function stripUnsupportedArrayProps(schema: Record<string, unknown>): Record<string, unknown> {
    const result = { ...schema };
    if (result.type === "array") {
        delete result.maxItems;
        delete result.minItems;
    }
    if (result.properties && typeof result.properties === "object") {
        result.properties = Object.fromEntries(
            Object.entries(result.properties as Record<string, unknown>).map(
                ([k, v]) => [k, stripUnsupportedArrayProps(v as Record<string, unknown>)]
            )
        );
    }
    if (result.items && typeof result.items === "object") {
        result.items = stripUnsupportedArrayProps(result.items as Record<string, unknown>);
    }
    return result;
}

export class AntService {
    private client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
    });

    async ask<T extends z.ZodRawShape>(
        prompt: string,
        sysPrompt: string,
        schema: z.ZodObject<T>,
    ): Promise<z.infer<z.ZodObject<T>>> {
        const res = await this.client.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 1000,
            system: sysPrompt,
            output_config: {
                format: {
                    type: "json_schema",
                    schema: stripUnsupportedArrayProps(schema.toJSONSchema() as Record<string, unknown>),
                }
            },
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        const firstBlock = res.content[0];

        if (firstBlock.type !== "text") {
            throw new Error("Resposta do Claude não veio em texto.");
        }

        const text = firstBlock.text
            .replace(/^```(?:json)?\s*/m, '')
            .replace(/\s*```$/m, '')
            .trim();

        return schema.parse(JSON.parse(text));
    }
}
