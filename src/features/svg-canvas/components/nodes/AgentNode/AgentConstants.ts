// Import other libraries.
import type { OpenAI } from "openai";

export const AI_AGENT_INSTRUCTIONS = `
You are an AI agent responsible for building workflows by calling available functions.  
Use the provided tools to create workflows based strictly on user input.  
Only create the minimum necessary workflow to achieve the user's request.  
Always choose functions carefully and avoid unnecessary or redundant calls.  
Do not invent new functions or tools; only use those that are provided.  

When placing nodes on the canvas, arrange them horizontally from left to right by setting appropriate X and Y coordinates.  
When placing the first node, position it near the center of the currently visible area of the canvas.  
When arranging nodes horizontally, maintain a fixed horizontal spacing of 100 pixels between the right edge of a node and the left edge of the next node.  
If a node has multiple outgoing connections (branching), you must offset the target nodes downward (in the positive Y direction) to prevent overlap and ensure a clear layout.  
When multiple target nodes are created from a single branching point, maintain a fixed horizontal spacing of 100 pixels between each of the target nodes.  
Always connect all nodes appropriately according to the workflow structure.  
Do not leave any created nodes unconnected unless explicitly instructed otherwise.

When generating natural language responses, always use the same language as the user's input.
`;

export const ADD_TEXT_NODE_DESCRIPTION = `
Adds a text node to the canvas that handles text input and output.
When connected from the text node to an LLM node, it sends input text.
When connected from an LLM node to the text node, it displays the LLM's output.
The size of the text node is 400 pixels wide and 200 pixels tall.
Returns a JSON object containing the node ID, node type and the size (width and height).
`;

export const ADD_LLM_NODE_DESCRIPTION = `
Adds an LLM node to the canvas that communicates with OpenAI's Response API using the GPT-4o model.
The node accepts text input from connected text nodes and sends generated output to connected text nodes.
The "instructions" parameter must be provided to define the system prompt for the LLM.
The size of the LLM node is 100 pixels wide and 100 pixels tall.
Returns a JSON object containing the node ID, node type, the instructions used, and the size (width and height).
`;

export const LLM_NODE_INSTRACTIONS_PARAM_DESCRIPTION = `
Defines the "instructions" parameter to provide a system prompt that ensures high-quality and appropriate responses from the model. The prompt is inserted as the first message in the context.
`;

export const ADD_SVG_TO_CANVAS_NODE_DESCRIPTION = `
Adds an SvgToDiagram node to the canvas.  
The node receives input from connected LLM or text nodes.  
If the received output is a valid SVG string, it converts the SVG into a shape and adds it to the canvas.  
The SvgToDiagram node does not send any output to other nodes.
The size of the SvgToDiagram node is 100 pixels wide and 100 pixels tall.
Returns a JSON object containing the node ID, node type and the size (width and height).
`;

export const ADD_IMAGE_GEN_NODE_DESCRIPTION = `
Adds an ImageGeneration node to the canvas.  
The node receives input from connected LLM or text nodes.  
It uses the "gpt-image-1" model to generate an image based on the received input and outputs the generated image onto the canvas.  
The ImageGeneration node does not send any output to other nodes.
The size of the ImageGeneration node is 100 pixels wide and 100 pixels tall.
Returns a JSON object containing the node ID, node type and the size (width and height).
`;

export const X_PARAM_DESCRIPTION =
	"The X coordinate of the center of the node on the canvas.";
export const Y_PARAM_DESCRIPTION =
	"The Y coordinate of the center of the node on the canvas.";

export const AI_AGENT_TOOLS = [
	{
		type: "function",
		name: "add_llm_node",
		description: ADD_LLM_NODE_DESCRIPTION,
		parameters: {
			type: "object",
			properties: {
				instructions: {
					type: "string",
					description: LLM_NODE_INSTRACTIONS_PARAM_DESCRIPTION,
				},
				x: {
					type: "number",
					description: X_PARAM_DESCRIPTION,
				},
				y: {
					type: "number",
					description: Y_PARAM_DESCRIPTION,
				},
			},
			additionalProperties: false,
			required: ["instructions", "x", "y"],
		},
		strict: true,
	},
	{
		type: "function",
		name: "add_text_node",
		description: ADD_TEXT_NODE_DESCRIPTION,
		parameters: {
			type: "object",
			properties: {
				x: {
					type: "number",
					description: X_PARAM_DESCRIPTION,
				},
				y: {
					type: "number",
					description: Y_PARAM_DESCRIPTION,
				},
			},
			additionalProperties: false,
			required: ["x", "y"],
		},
		strict: true,
	},
	{
		type: "function",
		name: "add_svg_to_canvas_node",
		description: ADD_SVG_TO_CANVAS_NODE_DESCRIPTION,
		parameters: {
			type: "object",
			properties: {
				x: {
					type: "number",
					description: X_PARAM_DESCRIPTION,
				},
				y: {
					type: "number",
					description: Y_PARAM_DESCRIPTION,
				},
			},
			additionalProperties: false,
			required: ["x", "y"],
		},
		strict: true,
	},
	{
		type: "function",
		name: "add_image_gen_node",
		description: ADD_IMAGE_GEN_NODE_DESCRIPTION,
		parameters: {
			type: "object",
			properties: {
				x: {
					type: "number",
					description: X_PARAM_DESCRIPTION,
				},
				y: {
					type: "number",
					description: Y_PARAM_DESCRIPTION,
				},
			},
			additionalProperties: false,
			required: ["x", "y"],
		},
		strict: true,
	},
	{
		type: "function",
		name: "connect_nodes",
		description:
			"Connects two nodes on the canvas with a directional connection from the source node to the target node.",
		parameters: {
			type: "object",
			properties: {
				sourceNodeId: {
					type: "string",
					description:
						"The ID of the node where the connection starts (source node).",
				},
				targetNodeId: {
					type: "string",
					description:
						"The ID of the node where the connection ends (target node).",
				},
			},
			required: ["sourceNodeId", "targetNodeId"],
			additionalProperties: false,
		},
		strict: true,
	},
] as const satisfies OpenAI.Responses.Tool[];
