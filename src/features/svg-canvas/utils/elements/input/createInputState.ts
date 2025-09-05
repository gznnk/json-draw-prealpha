// Import types.
import type { InputState } from "../../../types/state/elements/InputState";

// Import constants.
import { InputDefaultState } from "../../../constants/state/elements/InputDefaultState";

// Import utils.
import { newId } from "../../shapes/common/newId";
import { createRectangleConnectPoint } from "../../shapes/rectangle/createRectangleConnectPoint";

/**
 * Create Input state
 */
export const createInputState = ({
	x,
	y,
	text = "",
	width = InputDefaultState.width,
	height = InputDefaultState.height,
	rotation = InputDefaultState.rotation,
	scaleX = InputDefaultState.scaleX,
	scaleY = InputDefaultState.scaleY,
}: {
	x: number;
	y: number;
	text?: string;
	width?: number;
	height?: number;
	rotation?: number;
	scaleX?: number;
	scaleY?: number;
}): InputState => {
	// Create connect points for the input
	const connectPoints = createRectangleConnectPoint({
		x,
		y,
		width,
		height,
		rotation,
		scaleX,
		scaleY,
	});

	return {
		...InputDefaultState,
		id: newId(),
		x,
		y,
		text,
		width,
		height,
		rotation,
		scaleX,
		scaleY,
		connectPoints,
	};
};
