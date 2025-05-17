// Import types.
import type { VectorStoreNodeData } from "../../../types/data/nodes";

// Import utils.
import { newId } from "../../../utils/shapes";
import { createRectangleConnectPoint } from "../../../utils/shapes/rectangle";

export const createVectorStoreNodeData = ({
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
		type: "VectorStoreNode",
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
	} as VectorStoreNodeData;
};
