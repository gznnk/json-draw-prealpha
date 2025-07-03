// Import types.
import type { ImageGenNodeData } from "../../../types/data/nodes/ImageGenNodeData";

// Import utils.
import { newId } from "../../shapes/common/newId";
import { createRectangleConnectPoint } from "../../shapes/rectangle/createRectangleConnectPoint";

/**
 * Creates data for an ImageGen node with specified properties.
 *
 * @param x - The x coordinate of the node
 * @param y - The y coordinate of the node
 * @returns ImageGen node data object
 */
export const createImageGenNodeData = ({
	x,
	y,
}: {
	x: number;
	y: number;
}) => {
	const connectPoints = createRectangleConnectPoint({
		x,
		y,
		width: 100,
		height: 100,
		rotation: 0,
		scaleX: 1,
		scaleY: 1,
	});

	return {
		id: newId(),
		type: "ImageGenNode",
		x,
		y,
		width: 100,
		height: 100,
		rotation: 0,
		scaleX: 1,
		scaleY: 1,
		keepProportion: true,
		connectPoints,
		isSelected: false,
		showOutline: false,
		showTransformControls: false,
	} as ImageGenNodeData;
};
