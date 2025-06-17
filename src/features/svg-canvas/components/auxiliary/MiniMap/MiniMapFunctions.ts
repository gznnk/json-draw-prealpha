// Import types.
import type { Bounds } from "../../../types/base/Bounds";
import type { Diagram } from "../../../types/data/catalog/Diagram";

// Import utils.
import { isTransformativeData } from "../../../utils/validation/isTransformativeData";
import { isItemableData } from "../../../utils/validation/isItemableData";
import { calcItemsBoundingBox } from "../../../utils/math/geometry/calcItemsBoundingBox";

/**
 * Calculate viewport bounds in canvas coordinates based on current view state
 *
 * @param minX - The horizontal scroll offset of the viewport in pixels
 * @param minY - The vertical scroll offset of the viewport in pixels
 * @param containerWidth - The width of the viewport container in pixels
 * @param containerHeight - The height of the viewport container in pixels
 * @param zoom - The current zoom level (1.0 = 100%)
 * @returns Bounds object representing the viewport area in canvas coordinates
 */
export const calculateCanvasViewportBounds = (
	minX: number,
	minY: number,
	containerWidth: number,
	containerHeight: number,
	zoom: number,
): Bounds => {
	const viewportWidth = containerWidth / zoom;
	const viewportHeight = containerHeight / zoom;
	const viewportLeft = minX / zoom;
	const viewportTop = minY / zoom;

	return {
		x: viewportLeft,
		y: viewportTop,
		width: viewportWidth,
		height: viewportHeight,
	};
};

/**
 * Calculate combined canvas bounds including both items and viewport.
 * This ensures the minimap shows both content and current view area.
 *
 * @param items - Array of diagram items to calculate bounds for
 * @param viewportBounds - Current viewport bounds in canvas coordinates
 * @returns Combined bounds that encompass both items and viewport
 */
export const calculateCombinedCanvasBounds = (
	items: Diagram[],
	viewportBounds: Bounds,
): Bounds => {
	if (items.length === 0) {
		// If no items, use viewport bounds
		return viewportBounds;
	}

	// Calculate bounds of all items
	const itemBounds = calcItemsBoundingBox(items);

	// Combine item bounds with viewport bounds
	const combinedLeft = Math.min(itemBounds.left, viewportBounds.x);
	const combinedTop = Math.min(itemBounds.top, viewportBounds.y);
	const combinedRight = Math.max(
		itemBounds.right,
		viewportBounds.x + viewportBounds.width,
	);
	const combinedBottom = Math.max(
		itemBounds.bottom,
		viewportBounds.y + viewportBounds.height,
	);

	return {
		x: combinedLeft,
		y: combinedTop,
		width: combinedRight - combinedLeft,
		height: combinedBottom - combinedTop,
	};
};

/**
 * Calculate the scale factor for the minimap based on canvas bounds and minimap size
 *
 * @param canvasBounds - The bounds of the canvas content to be displayed
 * @param miniMapWidth - The available width of the minimap in pixels
 * @param miniMapHeight - The available height of the minimap in pixels
 * @returns Scale factor to fit canvas content within minimap dimensions
 */
export const calculateMiniMapScale = (
	canvasBounds: Bounds,
	miniMapWidth: number,
	miniMapHeight: number,
): number => {
	const scaleX = miniMapWidth / canvasBounds.width;
	const scaleY = miniMapHeight / canvasBounds.height;
	return Math.min(scaleX, scaleY);
};

/**
 * Calculate the viewport indicator bounds position and size in minimap coordinates
 *
 * @param minX - The horizontal scroll offset of the viewport in pixels
 * @param minY - The vertical scroll offset of the viewport in pixels
 * @param containerWidth - The width of the viewport container in pixels
 * @param containerHeight - The height of the viewport container in pixels
 * @param zoom - The current zoom level (1.0 = 100%)
 * @param canvasBounds - The bounds of the canvas content
 * @param scale - The scale factor for minimap coordinates
 * @param miniMapWidth - The width of the minimap in pixels
 * @param miniMapHeight - The height of the minimap in pixels
 * @returns Viewport indicator bounds in minimap coordinate system
 */
export const calculateMiniMapViewportIndicatorBounds = (
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
 * Calculate new viewport position for navigation based on click coordinates
 *
 * @param clientX - The X coordinate of the click event relative to the viewport
 * @param clientY - The Y coordinate of the click event relative to the viewport
 * @param svgElement - The SVG element representing the minimap
 * @param canvasBounds - The bounds of the canvas content
 * @param scale - The scale factor for minimap coordinates
 * @param miniMapWidth - The width of the minimap in pixels
 * @param miniMapHeight - The height of the minimap in pixels
 * @param containerWidth - The width of the viewport container in pixels
 * @param containerHeight - The height of the viewport container in pixels
 * @param zoom - The current zoom level (1.0 = 100%)
 * @returns New viewport position with minX and minY coordinates
 */
export const calculateNavigationPosition = (
	clientX: number,
	clientY: number,
	svgElement: SVGSVGElement,
	canvasBounds: Bounds,
	scale: number,
	miniMapWidth: number,
	miniMapHeight: number,
	containerWidth: number,
	containerHeight: number,
	zoom: number,
): { minX: number; minY: number } => {
	const rect = svgElement.getBoundingClientRect();
	const clickX = clientX - rect.left;
	const clickY = clientY - rect.top;

	// Transform click coordinates to canvas coordinates
	const canvasCoords = transformFromMiniMapCoords(
		clickX,
		clickY,
		canvasBounds,
		scale,
		miniMapWidth,
		miniMapHeight,
	);

	// Calculate new viewport position to center the clicked point
	const viewportWidth = containerWidth / zoom;
	const viewportHeight = containerHeight / zoom;

	const newViewportX = canvasCoords.x - viewportWidth / 2;
	const newViewportY = canvasCoords.y - viewportHeight / 2;

	// Convert back to minX, minY format
	const newMinX = newViewportX * zoom;
	const newMinY = newViewportY * zoom;

	return { minX: newMinX, minY: newMinY };
};

/**
 * Calculate relative position within viewport for drag offset
 *
 * @param clientX - The X coordinate of the click event relative to the viewport
 * @param clientY - The Y coordinate of the click event relative to the viewport
 * @param svgElement - The SVG element representing the minimap
 * @param viewportRect - The viewport rectangle bounds in minimap coordinates
 * @returns Relative position as ratio from center (range: -0.5 to 0.5)
 */
export const calculateDragOffsetRatio = (
	clientX: number,
	clientY: number,
	svgElement: SVGSVGElement,
	viewportRect: { x: number; y: number; width: number; height: number },
): { x: number; y: number } => {
	const rect = svgElement.getBoundingClientRect();
	const clickX = clientX - rect.left;
	const clickY = clientY - rect.top;

	const relativeX = (clickX - viewportRect.x) / viewportRect.width;
	const relativeY = (clickY - viewportRect.y) / viewportRect.height;

	// Store as ratio offset from center (range: -0.5 to 0.5)
	return {
		x: relativeX - 0.5,
		y: relativeY - 0.5,
	};
};

/**
 * Calculate drag navigation position with offset adjustment
 *
 * @param clientX - The X coordinate of the current mouse position relative to the viewport
 * @param clientY - The Y coordinate of the current mouse position relative to the viewport
 * @param svgElement - The SVG element representing the minimap
 * @param dragOffsetRatio - The stored drag offset ratio from the initial click
 * @param viewportRect - The viewport rectangle bounds in minimap coordinates
 * @param canvasBounds - The bounds of the canvas content
 * @param scale - The scale factor for minimap coordinates
 * @param miniMapWidth - The width of the minimap in pixels
 * @param miniMapHeight - The height of the minimap in pixels
 * @param containerWidth - The width of the viewport container in pixels
 * @param containerHeight - The height of the viewport container in pixels
 * @param zoom - The current zoom level (1.0 = 100%)
 * @returns New viewport position with minX and minY coordinates
 */
export const calculateDragNavigationPosition = (
	clientX: number,
	clientY: number,
	svgElement: SVGSVGElement,
	dragOffsetRatio: { x: number; y: number },
	viewportRect: { x: number; y: number; width: number; height: number },
	canvasBounds: Bounds,
	scale: number,
	miniMapWidth: number,
	miniMapHeight: number,
	containerWidth: number,
	containerHeight: number,
	zoom: number,
): { minX: number; minY: number } => {
	const rect = svgElement.getBoundingClientRect();
	const currentX = clientX - rect.left;
	const currentY = clientY - rect.top;

	// Calculate dynamic offset based on current viewport size and stored ratio
	const dynamicOffsetX = dragOffsetRatio.x * viewportRect.width;
	const dynamicOffsetY = dragOffsetRatio.y * viewportRect.height;

	// Adjust for drag offset to maintain relative position
	const targetX = currentX - dynamicOffsetX;
	const targetY = currentY - dynamicOffsetY;

	// Transform target coordinates to canvas coordinates
	const canvasCoords = transformFromMiniMapCoords(
		targetX,
		targetY,
		canvasBounds,
		scale,
		miniMapWidth,
		miniMapHeight,
	);

	// Calculate new viewport position to center at target point
	const viewportWidth = containerWidth / zoom;
	const viewportHeight = containerHeight / zoom;

	const newViewportX = canvasCoords.x - viewportWidth / 2;
	const newViewportY = canvasCoords.y - viewportHeight / 2;

	// Convert back to minX, minY format
	const newMinX = newViewportX * zoom;
	const newMinY = newViewportY * zoom;

	return { minX: newMinX, minY: newMinY };
};

/**
 * Recursively extract all transformative items from a diagram array,
 * including items inside groups
 *
 * @param items - Array of diagram items to extract transformative items from
 * @returns Array of transformative items found recursively
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

/**
 * Generate minimap item representations from diagram items.
 * Transforms item coordinates to minimap coordinate system.
 *
 * @param items - Array of diagram items to generate minimap representations for
 * @param canvasBounds - The bounds of the canvas content
 * @param scale - The scale factor for minimap coordinates
 * @param miniMapWidth - The width of the minimap in pixels
 * @param miniMapHeight - The height of the minimap in pixels
 * @returns Array of minimap item objects with id, position and dimensions
 */
export const generateMiniMapItems = (
	items: Diagram[],
	canvasBounds: Bounds,
	scale: number,
	miniMapWidth: number,
	miniMapHeight: number,
): Array<{
	id: string;
	x: number;
	y: number;
	width: number;
	height: number;
}> => {
	// Extract all transformative items recursively, including from groups
	const allTransformativeItems = extractTransformativeItemsRecursive(items);

	return allTransformativeItems.map((item) => {
		// At this point, item is guaranteed to be transformative by the extraction function
		const transformativeItem = item as Diagram & {
			x: number;
			y: number;
			width: number;
			height: number;
		};

		// Transform item coordinates to minimap coordinates
		const topLeft = transformToMiniMapCoords(
			transformativeItem.x - transformativeItem.width / 2,
			transformativeItem.y - transformativeItem.height / 2,
			canvasBounds,
			scale,
			miniMapWidth,
			miniMapHeight,
		);

		const itemWidth = transformativeItem.width * scale;
		const itemHeight = transformativeItem.height * scale;

		return {
			id: transformativeItem.id,
			x: topLeft.x,
			y: topLeft.y,
			width: Math.max(1, itemWidth),
			height: Math.max(1, itemHeight),
		};
	});
};

/**
 * Transform canvas coordinates to minimap coordinates
 *
 * @param x - The X coordinate in canvas space
 * @param y - The Y coordinate in canvas space
 * @param canvasBounds - The bounds of the canvas content
 * @param scale - The scale factor for minimap coordinates
 * @param miniMapWidth - The width of the minimap in pixels
 * @param miniMapHeight - The height of the minimap in pixels
 * @returns Coordinates transformed to minimap coordinate system
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
 *
 * @param x - The X coordinate in minimap space
 * @param y - The Y coordinate in minimap space
 * @param canvasBounds - The bounds of the canvas content
 * @param scale - The scale factor for minimap coordinates
 * @param miniMapWidth - The width of the minimap in pixels
 * @param miniMapHeight - The height of the minimap in pixels
 * @returns Coordinates transformed back to canvas coordinate system
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
