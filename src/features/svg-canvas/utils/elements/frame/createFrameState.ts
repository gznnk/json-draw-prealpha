// Import types.
import type { FrameState } from "../../../types/state/elements/FrameState";

// Import constants.
import { FrameDefaultState } from "../../../constants/state/elements/FrameDefaultState";

// Import utils.
import { newId } from "../../../utils/shapes/common/newId";
import { createRectangleConnectPoint } from "../../shapes/rectangle/createRectangleConnectPoint";

/**
 * Creates frame state with the specified properties.
 *
 * @param params - Frame parameters including position and dimensions.
 * @returns The created frame state object.
 */
export const createFrameState = ({
	x,
	y,
	width = 100,
	height = 100,
	rotation = 0,
	scaleX = 1,
	scaleY = 1,
}: {
	x: number;
	y: number;
	width?: number;
	height?: number;
	rotation?: number;
	scaleX?: number;
	scaleY?: number;
}): FrameState => {
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
		...FrameDefaultState,
		id: newId(),
		x,
		y,
		width,
		height,
		rotation,
		scaleX,
		scaleY,
		connectPoints,
	} as FrameState;
};