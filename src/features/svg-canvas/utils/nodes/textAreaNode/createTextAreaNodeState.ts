// Import utils.
import { createRectangleState } from "../../shapes/rectangle/createRectangleState";

// Import types.
import type { TextAreaNodeState } from "../../../types/state/nodes/TextAreaNodeState";

// Import constants.
import { TextAreaNodeDefaultState } from "../../../constants/state/nodes/TextAreaNodeDefaultState";
import { createTextState } from "../../elements/text/createTextState";

/**
 * Creates state for a TextArea node with specified properties.
 *
 * @param x - The x coordinate of the node
 * @param y - The y coordinate of the node
 * @returns TextArea node state object
 */
export const createTextAreaNodeState = ({
	x,
	y,
}: {
	x: number;
	y: number;
}) => {
	const state = {
		...createRectangleState({
			...TextAreaNodeDefaultState,
			x,
			y,
		}),
		type: "TextAreaNode",
		items: [
			{
				...createTextState({
					x,
					y: y + 20,
					width: TextAreaNodeDefaultState.width - 10,
					height: TextAreaNodeDefaultState.height - 30,
					text: "Text Area",
				}),
			},
		],
	} as TextAreaNodeState;

	return state;
};
