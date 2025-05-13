// Import functions related to SvgCanvas.
import { newId } from "../../../utils/shapes";
import { createRectangleConnectPoint } from "../../../utils/shapes/rectangle";

// Import related to this component.
import type { WebSearchNodeData } from "./WebSearchNodeTypes";

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
