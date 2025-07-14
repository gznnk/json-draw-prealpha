// Import types.
import type { PageDesignNodeData } from "../../../types/data/nodes/PageDesignNodeData";

// Import utils.
import { newId } from "../../../utils/shapes/common/newId";
import { createRectangleConnectPoint } from "../../../utils/shapes/rectangle/createRectangleConnectPoint";

export const createPageDesignNodeData = ({
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
		type: "PageDesignNode",
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
		showConnectPoints: false,
	} as PageDesignNodeData;
};
