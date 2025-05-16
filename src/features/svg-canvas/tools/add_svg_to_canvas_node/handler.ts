// Import functions related to SvgCanvas.
import { dispatchNewItemEvent } from "../../canvas/observers/addNewItem";
import { createSvgToDiagramNodeData } from "../../components/nodes/SvgToDiagramNode";
import { newEventId } from "../../utils";
import type {
	FunctionCallHandler,
	FunctionCallInfo,
} from "../../../llm-client/types";

/**
 * Handles the addition of an SVG Diagram node to the canvas.
 * Creates a new SVG Diagram node at the specified coordinates and dispatches a new item event.
 *
 * @param functionCall - The function call information containing x and y coordinates
 * @returns Object containing the ID, type, width, and height of the created node or null if coordinates are missing
 */
export const handler: FunctionCallHandler = (
	functionCall: FunctionCallInfo,
) => {
	const args = functionCall.arguments as { x: number; y: number };

	if (typeof args.x === "number" && typeof args.y === "number") {
		// Create a new SVG Diagram node with the specified x and y coordinates
		const data = createSvgToDiagramNodeData({
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
