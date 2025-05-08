// Import functions related to SvgCanvas.
import { dispatchNewItemEvent } from "../../canvas/observers/addNewItem";
import { createLLMNodeData } from "../../components/nodes/LLMNode";
import { newEventId } from "../../utils";

/**
 * Function to handle the addition of an LLM node.
 *
 * @param args - The arguments for the function, including x, y coordinates and instructions.
 * @returns - An object containing the ID, type, width, and height of the created node.
 */
// biome-ignore lint/suspicious/noExplicitAny: argument type is not known
export const handler = (args: any) => {
	if ("x" in args && "y" in args && "instructions" in args) {
		// Create a new LLM node with the specified x, y coordinates and instructions.
		const data = createLLMNodeData({
			x: args.x,
			y: args.y,
			text: args.instructions,
		});

		// Trigger a new item event with the created node data.
		dispatchNewItemEvent({
			eventId: newEventId(),
			item: data,
		});

		// Return the created node data.
		return {
			id: data.id,
			type: "LLMNode",
			instructions: args.instructions,
			width: data.width,
			height: data.height,
		};
	}
};
