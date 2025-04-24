// Import React.
import type React from "react";
import { memo } from "react";

// Import functions related to SvgCanvas.
import { createSvgTransform } from "../../../utils/Diagram";
import { degreesToRadians } from "../../../utils/Math";

/**
 * Props for IconContainer component.
 */
type IconContainerProps = {
	x: number;
	y: number;
	width: number;
	height: number;
	rotation: number;
	scaleX: number;
	scaleY: number;
	iconWidth: number;
	iconHeight: number;
	pointerEvents?: string;
	children: React.ReactNode;
};

/**
 * IconContainer component.
 */
const IconContainerComponent: React.FC<IconContainerProps> = ({
	x,
	y,
	width,
	height,
	rotation,
	scaleX,
	scaleY,
	iconWidth,
	iconHeight,
	pointerEvents = "auto",
	children,
}) => {
	const iconTransform = createSvgTransform(
		(width / iconWidth) * scaleX,
		(height / iconHeight) * scaleY,
		degreesToRadians(rotation),
		x - (width / 2) * scaleX,
		y - (height / 2) * scaleY,
	);

	return (
		<g transform={iconTransform} pointerEvents={pointerEvents}>
			{children}
		</g>
	);
};

export const IconContainer = memo(IconContainerComponent);
