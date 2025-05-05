// Import functions related to SvgCanvas.
import { newId } from "../../../utils/Diagram";
import { createRectangleConnectPoint } from "../../shapes/Rectangle";

// Import related to this component.
import type { ImageGenNodeData } from "./ImageGenNodeTypes";

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
		isMultiSelectSource: false,
	} as ImageGenNodeData;
};
