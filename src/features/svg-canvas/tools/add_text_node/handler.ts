// Import functions related to SvgCanvas.
import { dispatchNewItemEvent } from "../../canvas/observers/addNewItem";
import { createTextAreaNodeData } from "../../utils/nodes/textAreaNode/createTextAreaNodeData";
import { newEventId } from "../../utils/common/newEventId";
import type {
	FunctionCallHandler,
	FunctionCallInfo,
} from "../../../llm-client/types";

/**
 * Handles the addition of a Text node to the canvas.
 * Creates a new Text node at the specified coordinates and dispatches a new item event.
 *
 * @param functionCall - The function call information containing x and y coordinates
 * @returns Object containing the ID, type, width, and height of the created node or null if coordinates are missing
 */
export const handler: FunctionCallHandler = (
	functionCall: FunctionCallInfo,
) => {
	const args = functionCall.arguments as { x: number; y: number };
	if (typeof args.x === "number" && typeof args.y === "number") {
		// Create a new Text node with the specified x and y coordinates
		const data = createTextAreaNodeData({
			x: args.x,
			y: args.y,
		});

		// Trigger a new item event with the created node data
		dispatchNewItemEvent({
			eventId: newEventId(),
			item: data,
		});

		// Return the created node data
		return {
			id: data.id,
			type: "TextNode",
			width: data.width,
			height: data.height,
		};
	}

	return null;
};
