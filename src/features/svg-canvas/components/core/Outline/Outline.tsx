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
	isSelected: boolean;
	isMultiSelectSource: boolean;
	showOutline?: boolean;
};

/**
 * Component that displays a selection outline around diagram elements.
 * Shows a dashed border when an element is selected but not the multi-select source.
 * Can also show outline for various states like area selection or when parent group is selected.
 */
const OutlineComponent: React.FC<OutlineProps> = ({
	x,
	y,
	width,
	height,
	rotation,
	scaleX,
	scaleY,
	isSelected,
	isMultiSelectSource,
	showOutline = false,
}) => {
	// Don't render if the component is not selected and not showing outline
	if (!isSelected && !showOutline) {
		return null;
	}

	// Hide the selection outline when the component is the source of a multi-selection
	if (isMultiSelectSource) {
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
