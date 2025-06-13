// Import React.
import { memo, useCallback, useMemo } from "react";
import type React from "react";

// Import types related to SvgCanvas.
import type { Diagram } from "../../../catalog/DiagramTypes";

// Import functions related to SvgCanvas.
import { calcCanvasBounds } from "../../../canvas/utils/calcCanvasBounds";

// Imports related to this component.
import {
	calculateMiniMapScale,
	calculateViewportRect,
	extractTransformativeItemsRecursive,
	transformFromMiniMapCoords,
	transformToMiniMapCoords,
} from "./MiniMapFunctions";
import {
	MiniMapBackground,
	MiniMapContainer,
	MiniMapItem,
	MiniMapSvg,
	ViewportIndicator,
} from "./MiniMapStyled";
import type { MiniMapProps } from "./MiniMapTypes";

/**
 * MiniMap component that shows an overview of the entire canvas
 * with current viewport indicator
 */
const MiniMapComponent: React.FC<MiniMapProps> = ({
	items,
	minX,
	minY,
	containerWidth,
	containerHeight,
	zoom,
	width = 200,
	height = 150,
	onNavigate,
}) => {
	// Calculate canvas bounds based on all items
	const canvasBounds = useMemo(() => {
		if (items.length === 0) {
			return { x: 0, y: 0, width: containerWidth, height: containerHeight };
		}
		return calcCanvasBounds(items);
	}, [items, containerWidth, containerHeight]);

	// Calculate minimap scale
	const scale = useMemo(() => {
		return calculateMiniMapScale(canvasBounds, width, height);
	}, [canvasBounds, width, height]);

	// Calculate viewport rectangle
	const viewportRect = useMemo(() => {
		return calculateViewportRect(
			minX,
			minY,
			containerWidth,
			containerHeight,
			zoom,
			canvasBounds,
			scale,
			width,
			height,
		);
	}, [
		minX,
		minY,
		containerWidth,
		containerHeight,
		zoom,
		canvasBounds,
		scale,
		width,
		height,
	]);

	// Handle click on minimap to navigate
	const handleClick = useCallback(
		(e: React.MouseEvent<SVGSVGElement>) => {
			if (!onNavigate) return;

			const rect = e.currentTarget.getBoundingClientRect();
			const clickX = e.clientX - rect.left;
			const clickY = e.clientY - rect.top;

			// Transform click coordinates to canvas coordinates
			const canvasCoords = transformFromMiniMapCoords(
				clickX,
				clickY,
				canvasBounds,
				scale,
				width,
				height,
			);

			// Calculate new viewport position to center the clicked point
			const viewportWidth = containerWidth / zoom;
			const viewportHeight = containerHeight / zoom;

			const newViewportX = canvasCoords.x - viewportWidth / 2;
			const newViewportY = canvasCoords.y - viewportHeight / 2;

			// Convert back to minX, minY format
			const newMinX = newViewportX * zoom;
			const newMinY = newViewportY * zoom;

			onNavigate(newMinX, newMinY);
		},
		[
			onNavigate,
			canvasBounds,
			scale,
			width,
			height,
			containerWidth,
			containerHeight,
			zoom,
		],
	); // Render minimap items
	const miniMapItems = useMemo(() => {
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
				width,
				height,
			);

			const itemWidth = transformativeItem.width * scale;
			const itemHeight = transformativeItem.height * scale;

			return (
				<MiniMapItem
					key={transformativeItem.id}
					x={topLeft.x}
					y={topLeft.y}
					width={Math.max(1, itemWidth)}
					height={Math.max(1, itemHeight)}
				/>
			);
		});
	}, [items, canvasBounds, scale, width, height]);

	return (
		<MiniMapContainer width={width} height={height}>
			<MiniMapSvg
				width={width}
				height={height}
				viewBox={`0 0 ${width} ${height}`}
				onClick={handleClick}
			>
				{/* Background */}
				<MiniMapBackground x={0} y={0} width={width} height={height} />

				{/* Render items */}
				{miniMapItems}

				{/* Viewport indicator */}
				<ViewportIndicator
					x={viewportRect.x}
					y={viewportRect.y}
					width={viewportRect.width}
					height={viewportRect.height}
				/>
			</MiniMapSvg>
		</MiniMapContainer>
	);
};

export const MiniMap = memo(MiniMapComponent);
