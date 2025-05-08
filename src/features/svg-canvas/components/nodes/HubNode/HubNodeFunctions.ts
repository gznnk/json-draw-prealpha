// Import functions related to SvgCanvas.
import { newId } from "../../../utils/diagram";
import { createEllipseConnectPoint } from "../../shapes/Ellipse";

// Import related to this component.
import type { HubNodeData } from "./HubNodeTypes";

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
		isMultiSelectSource: false,
	} as HubNodeData;
};
