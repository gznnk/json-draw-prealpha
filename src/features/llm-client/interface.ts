import type OpenAI from "openai";
import type { ToolDefinition } from "./types";

export type MessageParam = {
	role: "system" | "user" | "assistant";
	content: string;
};

export type LLMParams = {
	messages: OpenAI.Responses.ResponseInput;
	tools?: ToolDefinition[];
	onChunk: (delta: OpenAI.Responses.ResponseStreamEvent) => void;
};

export interface LLMClient {
	chat(params: LLMParams): Promise<void>;
}
