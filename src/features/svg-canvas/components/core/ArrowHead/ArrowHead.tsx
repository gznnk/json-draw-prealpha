// Import React.
import type React from "react";
import { memo } from "react";

// Import functions related to SvgCanvas.
import { createSvgTransform } from "../../../utils/Diagram";

/**
 * Shape of ArrowHead.
 */
export type ArrowHeadType = "Triangle" | "ConcaveTriangle" | "None";

const ARROW_HEAD_SIZE = 11;

/**
 * Properties of ArrowHead component.
 */
type ArrowHeadProps = {
	type: ArrowHeadType;
	x: number;
	y: number;
	color: string;
	radians: number;
};

/**
 * ArrowHead component.
 */
const ArrowHead: React.FC<ArrowHeadProps> = ({
	type,
	x,
	y,
	color,
	radians,
}) => {
	if (type === "None") return null;

	let points = undefined;
	if (type === "Triangle") {
		points = `0,0 ${ARROW_HEAD_SIZE / 2},${-ARROW_HEAD_SIZE} ${-ARROW_HEAD_SIZE / 2},${-ARROW_HEAD_SIZE}`;
	} else if (type === "ConcaveTriangle") {
		points = `0,0 ${ARROW_HEAD_SIZE / 2},${-ARROW_HEAD_SIZE} 0,${-ARROW_HEAD_SIZE * 0.86} ${-ARROW_HEAD_SIZE / 2},${-ARROW_HEAD_SIZE}`;
	}

	const transform = createSvgTransform(1, 1, radians, x, y);

	return <polygon points={points} fill={color} transform={transform} />;
};

export default memo(ArrowHead);
