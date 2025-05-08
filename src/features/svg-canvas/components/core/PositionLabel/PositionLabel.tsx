// Import React.
import type React from "react";
import { memo } from "react";

// Import types related to SvgCanvas.
import type { RectangleVertices } from "../../../types/CoordinateTypes";

// Import components related to SvgCanvas.
import { calcBottomLabelPosition } from "../BottomLabel";

// Import functions related to SvgCanvas.
import { calcRectangleVertices } from "../../../utils";

/**
 * Props for PositionLabel component.
 */
type PositionLabelProps = {
	x: number;
	y: number;
	width: number;
	height: number;
	rotation: number;
	scaleX: number;
	scaleY: number;
};

/**
 * PositionLabel component.
 */
const PositionLabelComponent: React.FC<PositionLabelProps> = ({
	x,
	y,
	width,
	height,
	rotation,
	scaleX,
	scaleY,
}) => {
	const vertices = calcRectangleVertices({
		x,
		y,
		width,
		height,
		rotation,
		scaleX,
		scaleY,
	});

	const { labelX, labelY } = calcBottomLabelPosition(vertices);

	let left = Number.POSITIVE_INFINITY;
	let top = Number.POSITIVE_INFINITY;
	for (const key of Object.keys(vertices)) {
		const vertex = vertices[key as keyof RectangleVertices];
		left = Math.min(left, vertex.x);
		top = Math.min(top, vertex.y);
	}

	return (
		<text
			x={labelX}
			y={labelY}
			fill="#555555" // Font color
			fontSize="12px"
			textAnchor="middle"
		>
			{`(${Math.round(left)}, ${Math.round(top)})`}
		</text>
	);
};

export const PositionLabel = memo(PositionLabelComponent);
