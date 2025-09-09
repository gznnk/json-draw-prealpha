// Import types.
import type { Frame } from "../../../types/core/Frame";

// Import utils.
import { affineTransformation } from "../../math/transform/affineTransformation";
import { degreesToRadians } from "../../math/common/degreesToRadians";

// Import constants.
import {
	BASE_MARGIN,
	HEADER_HEIGHT,
	HEADER_MARGIN_BOTTOM,
	HEADER_MARGIN_TOP,
} from "../../../components/nodes/LLMNode/LLMNodeConstants";

/**
 * Creates a Frame state for LLMNode Input component containing x, y, width, height, rotation, scaleX, and scaleY.
 *
 * @param x - The x coordinate of the node
 * @param y - The y coordinate of the node
 * @param width - Width of the node
 * @param height - Height of the node
 * @param rotation - Rotation of the node in degrees
 * @param scaleX - X scale of the node
 * @param scaleY - Y scale of the node
 * @returns Frame object with input dimensions and center position
 */
export const createLLMNodeInputFrame = ({
	x,
	y,
	width,
	height,
	rotation = 0,
	scaleX = 1,
	scaleY = 1,
}: {
	x: number;
	y: number;
	width: number;
	height: number;
	rotation?: number;
	scaleX?: number;
	scaleY?: number;
}): Frame => {
	// Calculate input dimensions
	const inputHeight =
		height -
		(HEADER_MARGIN_TOP + HEADER_HEIGHT + HEADER_MARGIN_BOTTOM + BASE_MARGIN);
	const inputWidth = width - BASE_MARGIN * 2;

	// Calculate center position with affine transformation
	const inputCenter = affineTransformation(
		0,
		-(
			height / 2 -
			(inputHeight / 2 +
				HEADER_MARGIN_TOP +
				HEADER_HEIGHT +
				HEADER_MARGIN_BOTTOM)
		),
		scaleX,
		scaleY,
		degreesToRadians(rotation),
		x,
		y,
	);

	return {
		x: inputCenter.x,
		y: inputCenter.y,
		width: inputWidth,
		height: inputHeight,
		rotation,
		scaleX,
		scaleY,
	};
};