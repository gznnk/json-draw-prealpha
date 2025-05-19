// Import functions related to SvgCanvas.
import { dispatchNewItemEvent } from "../../canvas/observers/addNewItem";
import { createImageGenNodeData } from "../../utils/nodes/imageGenNode/createImageGenNodeData";
import { newEventId } from "../../utils/common/newEventId";
import type {
	FunctionCallHandler,
	FunctionCallInfo,
} from "../../../../shared/llm-client/types";

/**
 * Handles the addition of an image generation node to the canvas.
 * Creates a new node at the specified coordinates and dispatches a new item event.
 *
 * @param functionCall - The function call information containing x and y coordinates
 * @returns Object containing the ID, type, width, and height of the created node or null if coordinates are missing
 */
export const handler: FunctionCallHandler = (
	functionCall: FunctionCallInfo,
) => {
	const args = functionCall.arguments as { x: number; y: number };
	if (typeof args.x === "number" && typeof args.y === "number") {
		// Create a new Image Generation node with the specified x and y coordinates
		const data = createImageGenNodeData({
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
			type: "SvgToDiagramNode",
			width: data.width,
			height: data.height,
		};
	}

	return null;
};
