// Import types.
import type { AgentNodeData } from "../../../types/data/nodes/AgentNodeData";

// Import utils.
import { newId } from "../../../utils/shapes/common/newId";
import { createRectangleConnectPoint } from "../../../utils/shapes/rectangle/createRectangleConnectPoint";

export const createAgentNodeData = ({
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
		type: "AgentNode",
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
	} as AgentNodeData;
};
