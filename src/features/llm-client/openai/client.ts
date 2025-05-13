import OpenAI from "openai";
import type { LLMClient, LLMParams } from "../interface";

export class OpenAIClient implements LLMClient {
	private readonly openai: OpenAI;

	constructor(apiKey: string) {
		this.openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
	}

	async chat({ messages, tools, onChunk }: LLMParams): Promise<void> {
		// Convert tools to OpenAI function format
		const openaiTools = tools?.map((tool) => ({
			type: "function",
			name: tool.name,
			description: tool.description,
			parameters: {
				type: "object",
				properties: tool.parameters.reduce(
					(acc, param) => {
						acc[param.name] = {
							type: "string",
							description: param.description,
						};
						return acc;
					},
					{} as Record<string, unknown>,
				),
				additionalProperties: false,
				required: tools.map((tool) => tool.name),
			},
			strict: true,
		})) as OpenAI.Responses.Tool[];

		const stream = await this.openai.responses.create({
			model: "gpt-4o",
			input: messages,
			tools: openaiTools,
			stream: true,
		});

		for await (const chunk of stream) {
			onChunk(chunk);
		}
	}
}
