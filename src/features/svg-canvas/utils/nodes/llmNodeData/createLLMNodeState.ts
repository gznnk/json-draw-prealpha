// Import utils.
import { createRectangleState } from "../../shapes/rectangle/createRectangleState";

// Import constants.
import { LLMNodeDefaultState } from "../../../constants/state/nodes/LLMNodeDefaultState";

/**
 * Creates state for an LLM node with specified properties.
 *
 * @param x - The x coordinate of the node
 * @param y - The y coordinate of the node
 * @param text - Optional text content of the node
 * @returns LLM node state object
 */
export const createLLMNodeState = ({
	x,
	y,
	text,
}: {
	x: number;
	y: number;
	text?: string;
}) => {
	const state = createRectangleState({
		x,
		y,
		stroke: LLMNodeDefaultState.stroke,
		fill: LLMNodeDefaultState.fill,
		textType: LLMNodeDefaultState.textType,
		textAlign: LLMNodeDefaultState.textAlign,
		verticalAlign: LLMNodeDefaultState.verticalAlign,
		fontColor: LLMNodeDefaultState.fontColor,
		fontSize: LLMNodeDefaultState.fontSize,
		text: text ?? LLMNodeDefaultState.text,
		keepProportion: LLMNodeDefaultState.keepProportion,
	});

	state.type = "LLMNode";

	return state;
};
