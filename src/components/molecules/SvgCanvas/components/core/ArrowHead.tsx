// Import React library.
import type React from "react";
import { memo } from "react";

// Import SvgCanvas related functions.
import { createSvgTransform } from "../../functions/Diagram";

const ARROW_HEAD_SIZE = 11;

/**
 * Properties of ArrowHead component.
 */
type ArrowHeadProps = {
	x: number;
	y: number;
	color: string;
	radians: number;
};

/**
 * ArrowHead component.
 */
const ArrowHead: React.FC<ArrowHeadProps> = ({ x, y, color, radians }) => {
	const points = `0,0 ${ARROW_HEAD_SIZE / 2},${-ARROW_HEAD_SIZE} ${-ARROW_HEAD_SIZE / 2},${-ARROW_HEAD_SIZE}`;

	const transform = createSvgTransform(1, 1, radians, x, y);

	return <polygon points={points} fill={color} transform={transform} />;
};

export default memo(ArrowHead);
