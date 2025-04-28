// Import other libraries.
import type { OpenAI } from "openai";

export const AI_AGENT_INSTRUCTIONS = `
You are an AI agent responsible for building workflows by calling available functions.  
Use the provided tools to create and modify workflows based on user input.  
Always select and call functions appropriately to achieve the user's goals.  
Do not invent new functions or tools; only use those that are provided.
`;

export const ADD_TEXT_NODE_DISCRIPTION = `
Adds a text node to the canvas that handles text input and output.
When connected from the text node to an LLM node, it sends input text.
When connected from an LLM node to the text node, it displays the LLM's output.
Returns the ID of the created text node.
`;

export const ADD_LLM_NODE_DISCRIPTION = `
Adds an LLM node to the canvas that communicates with OpenAI's Response API using the GPT-4o model.
The node accepts text input from connected text nodes and sends generated output to connected text nodes.
The "instructions" parameter must be provided to define the system prompt for the LLM.
Returns the ID of the created LLM node.
`;

export const AI_AGENT_TOOLS = [
	{
		type: "function",
		name: "add_llm_node",
		description: ADD_LLM_NODE_DISCRIPTION,
		parameters: {
			type: "object",
			properties: {
				instructions: {
					type: "string",
					description:
						'Defines the system prompt ("instructions") used when interacting with the model. It is inserted as the first message in the context.',
				},
			},
			additionalProperties: false,
			required: ["instructions"],
		},
		strict: true,
	},
	{
		type: "function",
		name: "add_text_node",
		description: ADD_TEXT_NODE_DISCRIPTION,
		parameters: {
			type: "object",
			properties: {},
			additionalProperties: false,
			required: [],
		},
		strict: true,
	},
] as const satisfies OpenAI.Responses.Tool[];
