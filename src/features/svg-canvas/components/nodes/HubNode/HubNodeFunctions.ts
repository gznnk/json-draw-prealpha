// Import types.
import type { HubNodeData } from "../../../types/data/nodes/HubNodeData";

// Import utils.
import { newId } from "../../../utils/shapes/common/newId";
import { createEllipseConnectPoint } from "../../../utils/shapes/ellipse/createEllipseConnectPoint";

export const createHubNodeData = ({
	x,
	y,
}: {
	x: number;
	y: number;
}) => {
	const connectPoints = createEllipseConnectPoint({
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
		type: "HubNode",
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
	} as HubNodeData;
};
