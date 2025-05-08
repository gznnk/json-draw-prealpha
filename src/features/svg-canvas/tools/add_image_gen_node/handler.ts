// Import functions related to SvgCanvas.
import { dispatchNewItemEvent } from "../../canvas/observers/addNewItem";
import { createImageGenNodeData } from "../../components/nodes/ImageGenNode";
import { newEventId } from "../../utils";

/**
 * Function to handle the addition of an image generation node.
 *
 * @param args - The arguments for the function, including x and y coordinates.
 * @returns - An object containing the ID, type, width, and height of the created node.
 */
// biome-ignore lint/suspicious/noExplicitAny: argument type is not known
export const handler = (args: any) => {
	if ("x" in args && "y" in args) {
		// Create a new Image Generation node with the specified x and y coordinates.
		const data = createImageGenNodeData({
			x: args.x,
			y: args.y,
		});

		// Trigger a new item event with the created node data.
		dispatchNewItemEvent({
			eventId: newEventId(),
			item: data,
		});

		// Return the created node data.
		return {
			id: data.id,
			type: "SvgToDiagramNode",
			width: data.width,
			height: data.height,
		};
	}
};
