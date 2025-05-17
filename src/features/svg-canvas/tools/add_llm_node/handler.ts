// Import functions related to SvgCanvas.
import { dispatchNewItemEvent } from "../../canvas/observers/addNewItem";
import { createLLMNodeData } from "../../utils/nodes/llmNodeData/createLLMNodeData";
import { newEventId } from "../../utils/common/newEventId";
import type {
	FunctionCallHandler,
	FunctionCallInfo,
} from "../../../llm-client/types";

/**
 * Handles the addition of an LLM node to the canvas.
 * Creates a new LLM node at the specified coordinates with the given instructions and dispatches a new item event.
 *
 * @param functionCall - The function call information containing x, y coordinates and instructions
 * @returns Object containing the ID, type, instructions, width, and height of the created node or null if required arguments are missing
 */
export const handler: FunctionCallHandler = (
	functionCall: FunctionCallInfo,
) => {
	const args = functionCall.arguments as {
		x: number;
		y: number;
		instructions: string;
	};

	if (
		typeof args.x === "number" &&
		typeof args.y === "number" &&
		typeof args.instructions === "string"
	) {
		// Create a new LLM node with the specified x, y coordinates and instructions
		const data = createLLMNodeData({
			x: args.x,
			y: args.y,
			text: args.instructions,
		});

		// Trigger a new item event with the created node data
		dispatchNewItemEvent({
			eventId: newEventId(),
			item: data,
		});

		// Return the created node data
		return {
			id: data.id,
			type: "LLMNode",
			instructions: args.instructions,
			width: data.width,
			height: data.height,
		};
	}

	return null;
};
