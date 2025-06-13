import type { Bounds } from "../../../types/base/Bounds";
import type { Diagram } from "../../../catalog/DiagramTypes";
import { isTransformativeData } from "../../../utils/validation/isTransformativeData";
import { isItemableData } from "../../../utils/validation/isItemableData";

/**
 * Calculate the minimap scale factor based on canvas bounds and minimap size
 */
export const calculateMiniMapScale = (
	canvasBounds: Bounds,
	miniMapWidth: number,
	miniMapHeight: number,
): number => {
	const scaleX = miniMapWidth / canvasBounds.width;
	const scaleY = miniMapHeight / canvasBounds.height;

	// Use the smaller scale to ensure everything fits
	return Math.min(scaleX, scaleY, 1);
};

/**
 * Transform canvas coordinates to minimap coordinates
 */
export const transformToMiniMapCoords = (
	x: number,
	y: number,
	canvasBounds: Bounds,
	scale: number,
	miniMapWidth: number,
	miniMapHeight: number,
): { x: number; y: number } => {
	// Translate to canvas origin
	const relativeX = x - canvasBounds.x;
	const relativeY = y - canvasBounds.y;

	// Scale to minimap size
	const scaledX = relativeX * scale;
	const scaledY = relativeY * scale;

	// Center in minimap if canvas is smaller than minimap
	const offsetX = (miniMapWidth - canvasBounds.width * scale) / 2;
	const offsetY = (miniMapHeight - canvasBounds.height * scale) / 2;

	return {
		x: scaledX + Math.max(0, offsetX),
		y: scaledY + Math.max(0, offsetY),
	};
};

/**
 * Transform minimap coordinates back to canvas coordinates
 */
export const transformFromMiniMapCoords = (
	x: number,
	y: number,
	canvasBounds: Bounds,
	scale: number,
	miniMapWidth: number,
	miniMapHeight: number,
): { x: number; y: number } => {
	// Remove centering offset
	const offsetX = (miniMapWidth - canvasBounds.width * scale) / 2;
	const offsetY = (miniMapHeight - canvasBounds.height * scale) / 2;

	const adjustedX = x - Math.max(0, offsetX);
	const adjustedY = y - Math.max(0, offsetY);

	// Scale back to canvas size
	const canvasX = adjustedX / scale + canvasBounds.x;
	const canvasY = adjustedY / scale + canvasBounds.y;

	return {
		x: canvasX,
		y: canvasY,
	};
};

/**
 * Calculate the viewport rectangle in minimap coordinates
 */
export const calculateViewportRect = (
	minX: number,
	minY: number,
	containerWidth: number,
	containerHeight: number,
	zoom: number,
	canvasBounds: Bounds,
	scale: number,
	miniMapWidth: number,
	miniMapHeight: number,
): { x: number; y: number; width: number; height: number } => {
	// Calculate viewport bounds in canvas coordinates
	const viewportX = minX / zoom;
	const viewportY = minY / zoom;
	const viewportWidth = containerWidth / zoom;
	const viewportHeight = containerHeight / zoom;

	// Transform to minimap coordinates
	const topLeft = transformToMiniMapCoords(
		viewportX,
		viewportY,
		canvasBounds,
		scale,
		miniMapWidth,
		miniMapHeight,
	);

	const bottomRight = transformToMiniMapCoords(
		viewportX + viewportWidth,
		viewportY + viewportHeight,
		canvasBounds,
		scale,
		miniMapWidth,
		miniMapHeight,
	);

	return {
		x: topLeft.x,
		y: topLeft.y,
		width: bottomRight.x - topLeft.x,
		height: bottomRight.y - topLeft.y,
	};
};

/**
 * Recursively extract all transformative items from a diagram array,
 * including items inside groups
 */
export const extractTransformativeItemsRecursive = (
	items: Diagram[],
): Diagram[] => {
	const result: Diagram[] = [];

	for (const item of items) {
		if (item.type === "Group" && isItemableData(item)) {
			// For groups, recursively extract items from their children
			const childItems = extractTransformativeItemsRecursive(item.items || []);
			result.push(...childItems);
		} else if (isTransformativeData(item)) {
			// For non-group transformative items, add them directly
			result.push(item);
		}
	}

	return result;
};
