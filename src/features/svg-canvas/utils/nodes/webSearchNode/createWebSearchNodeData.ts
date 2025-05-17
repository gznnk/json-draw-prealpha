// Import types.
import type { WebSearchNodeData } from "../../../types/data/nodes/WebSearchNodeData";

// Import utils.
import { newId } from "../../shapes";
import { createRectangleConnectPoint } from "../../shapes/rectangle";

/**
 * Creates data for a WebSearch node with specified properties.
 *
 * @param x - The x coordinate of the node
 * @param y - The y coordinate of the node
 * @returns WebSearch node data object
 */
export const createWebSearchNodeData = ({
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
		type: "WebSearchNode",
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
		isMultiSelectSource: false,
	} as WebSearchNodeData;
};
