// Import React.
import type React from "react";
import { memo } from "react";

// Import utils.
import { createSvgTransform } from "../../../utils/shapes/common/createSvgTransform";
import { degreesToRadians } from "../../../utils/math/common/degreesToRadians";

/**
 * Props for the Outline component.
 */
type OutlineProps = {
	x: number;
	y: number;
	width: number;
	height: number;
	rotation: number;
	scaleX: number;
	scaleY: number;
	showOutline: boolean;
};

/**
 * Component that displays a selection outline around diagram elements.
 * Shows a dashed border when showOutline is true.
 * Can show outline for various states like area selection or when parent group is selected.
 */
const OutlineComponent: React.FC<OutlineProps> = ({
	x,
	y,
	width,
	height,
	rotation,
	scaleX,
	scaleY,
	showOutline,
}) => {
	// Don't render if not showing outline
	if (!showOutline) {
		return null;
	}

	const radians = degreesToRadians(rotation);

	return (
		<g transform="translate(0.5,0.5)">
			<rect
				x={-width / 2}
				y={-height / 2}
				width={width}
				height={height}
				fill="transparent"
				stroke="rgb(100, 149, 237)"
				strokeWidth="1px"
				strokeDasharray="3,3"
				pointerEvents="none"
				transform={createSvgTransform(scaleX, scaleY, radians, x, y)}
			/>
		</g>
	);
};

export const Outline = memo(OutlineComponent);
