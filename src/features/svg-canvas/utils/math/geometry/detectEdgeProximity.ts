import { AUTO_SCROLL_THRESHOLD } from "../../../constants/Constants";
import type { SvgViewport } from "../../../types/core/SvgViewport";

/**
 * Result type for edge proximity detection.
 */
export type EdgeProximityResult = {
	/** Whether the cursor is near any edge */
	isNearEdge: boolean;
	/** Horizontal edge proximity ("left" | "right" | null) */
	horizontal: "left" | "right" | null;
	/** Vertical edge proximity ("top" | "bottom" | null) */
	vertical: "top" | "bottom" | null;
};

/**
 * Detects if the cursor is near the edges of the canvas viewport.
 *
 * @param viewport - SVG viewport information
 * @param cursorX - Cursor X position in SVG coordinates
 * @param cursorY - Cursor Y position in SVG coordinates
 * @returns Object containing edge proximity information
 */
export const detectEdgeProximity = (
	viewport: SvgViewport,
	cursorX: number,
	cursorY: number,
): EdgeProximityResult => {
	const { zoom, minX, minY, containerWidth, containerHeight } = viewport;

	// Calculate the viewBox boundaries considering zoom
	const viewBoxX = minX / zoom;
	const viewBoxY = minY / zoom;
	const viewBoxWidth = containerWidth / zoom;
	const viewBoxHeight = containerHeight / zoom;

	// Calculate distances from each edge in viewBox coordinates
	const distFromLeft = cursorX - viewBoxX;
	const distFromTop = cursorY - viewBoxY;
	const distFromRight = viewBoxX + viewBoxWidth - cursorX;
	const distFromBottom = viewBoxY + viewBoxHeight - cursorY;

	// Determine which edges the cursor is close to
	let horizontal: "left" | "right" | null = null;
	let vertical: "top" | "bottom" | null = null;

	// Calculate zoom-adjusted threshold for more consistent behavior across zoom levels
	const adjustedThreshold = AUTO_SCROLL_THRESHOLD * zoom;

	// Check horizontal edges
	if (distFromLeft < adjustedThreshold) {
		horizontal = "left";
	} else if (distFromRight < adjustedThreshold) {
		horizontal = "right";
	}

	// Check vertical edges
	if (distFromTop < adjustedThreshold) {
		vertical = "top";
	} else if (distFromBottom < adjustedThreshold) {
		vertical = "bottom";
	}

	const isNearEdge = horizontal !== null || vertical !== null;

	return {
		isNearEdge,
		horizontal,
		vertical,
	};
};
