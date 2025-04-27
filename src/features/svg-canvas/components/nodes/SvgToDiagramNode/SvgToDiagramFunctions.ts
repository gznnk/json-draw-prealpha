import { newId } from "../../../utils/Diagram";
import { createRectangleConnectPoint } from "../../shapes/Rectangle";
import type { SvgToDiagramNodeData } from "./SvgToDiagramNodeTypes";

export const createSvgToDiagramNodeData = ({
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
		type: "SvgToDiagramNode",
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
	} as SvgToDiagramNodeData;
};
