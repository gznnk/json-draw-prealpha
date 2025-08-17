// Import utils.
import { createRectangleState } from "../../shapes/rectangle/createRectangleState";

// Import constants.
import { TextAreaNodeDefaultState } from "../../../constants/state/nodes/TextAreaNodeDefaultState";

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
	const state = createRectangleState({
		x,
		y,
		width: TextAreaNodeDefaultState.width,
		height: TextAreaNodeDefaultState.height,
		radius: TextAreaNodeDefaultState.radius,
		stroke: TextAreaNodeDefaultState.stroke,
		strokeWidth: TextAreaNodeDefaultState.strokeWidth,
		fill: TextAreaNodeDefaultState.fill,
		textType: TextAreaNodeDefaultState.textType,
		textAlign: TextAreaNodeDefaultState.textAlign,
		verticalAlign: TextAreaNodeDefaultState.verticalAlign,
		fontSize: TextAreaNodeDefaultState.fontSize,
		fontColor: TextAreaNodeDefaultState.fontColor,
	});

	state.type = "TextAreaNode";

	return state;
};
