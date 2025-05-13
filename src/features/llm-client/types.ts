import type OpenAI from "openai";

export type ToolParameter = {
	name: string;
	description: string;
};

export type ToolDefinition = {
	name: string;
	description: string;
	parameters: ToolParameter[];
};

export type MessageParam = OpenAI.Responses.ResponseInput;
