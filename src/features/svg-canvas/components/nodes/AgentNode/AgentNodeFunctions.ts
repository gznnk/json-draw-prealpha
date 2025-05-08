// Import functions related to SvgCanvas.
import { newId } from "../../../utils/diagram";
import { createRectangleConnectPoint } from "../../shapes/Rectangle";

// Import related to this component.
import type { AgentNodeData } from "./AgentNodeTypes";

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
		isMultiSelectSource: false,
	} as AgentNodeData;
};
