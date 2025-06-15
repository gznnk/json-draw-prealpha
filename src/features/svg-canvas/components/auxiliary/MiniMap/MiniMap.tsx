// Import React.
import { memo, useCallback, useMemo, useRef, useState } from "react";
import type React from "react";

// Imports related to this component.
import {
	calculateCombinedCanvasBounds,
	calculateMiniMapScale,
	calculateViewportBounds,
	calculateViewportRect,
	generateMiniMapItems,
	transformFromMiniMapCoords,
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
	// Calculate canvas bounds based on all items and current viewport
	const canvasBounds = useMemo(() => {
		const viewportBounds = calculateViewportBounds(
			minX,
			minY,
			containerWidth,
			containerHeight,
			zoom,
		);

		return calculateCombinedCanvasBounds(items, viewportBounds);
	}, [items, minX, minY, containerWidth, containerHeight, zoom]);

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
	const handleNavigate = useCallback(
		(clientX: number, clientY: number, svgElement: SVGSVGElement) => {
			if (!onNavigate) return;

			const rect = svgElement.getBoundingClientRect();
			const clickX = clientX - rect.left;
			const clickY = clientY - rect.top;

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
	);

	// State to track if pointer is down and drag offset
	const [isPointerDown, setIsPointerDown] = useState(false);
	const [dragOffsetRatio, setDragOffsetRatio] = useState({ x: 0, y: 0 });
	const [hasDragged, setHasDragged] = useState(false);
	const svgRef = useRef<SVGSVGElement>(null);

	const handleClick = useCallback(
		(e: React.MouseEvent<SVGSVGElement>) => {
			// Only navigate on click if no drag operation occurred
			if (!hasDragged) {
				handleNavigate(e.clientX, e.clientY, e.currentTarget);
			}
		},
		[handleNavigate, hasDragged],
	);

	const handlePointerDown = useCallback(
		(e: React.PointerEvent<SVGSVGElement>) => {
			setIsPointerDown(true);
			setHasDragged(false);
			e.currentTarget.setPointerCapture(e.pointerId);

			// Calculate offset from pointer position to viewport center
			const rect = e.currentTarget.getBoundingClientRect();
			const clickX = e.clientX - rect.left;
			const clickY = e.clientY - rect.top;

			// Check if click is within ViewportIndicator bounds
			const isWithinViewport =
				clickX >= viewportRect.x &&
				clickX <= viewportRect.x + viewportRect.width &&
				clickY >= viewportRect.y &&
				clickY <= viewportRect.y + viewportRect.height;

			if (isWithinViewport) {
				// Calculate relative position within viewport (0 to 1)
				const relativeX = (clickX - viewportRect.x) / viewportRect.width;
				const relativeY = (clickY - viewportRect.y) / viewportRect.height;

				// Store as ratio offset from center (range: -0.5 to 0.5)
				setDragOffsetRatio({
					x: relativeX - 0.5,
					y: relativeY - 0.5,
				});
			} else {
				// When clicking outside viewport, no offset (center the viewport on cursor)
				setDragOffsetRatio({ x: 0, y: 0 });
			}
		},
		[viewportRect.x, viewportRect.y, viewportRect.width, viewportRect.height],
	);

	const handlePointerMove = useCallback(
		(e: React.PointerEvent<SVGSVGElement>) => {
			if (!isPointerDown) return;

			setHasDragged(true);

			const rect = e.currentTarget.getBoundingClientRect();
			const currentX = e.clientX - rect.left;
			const currentY = e.clientY - rect.top;

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
				width,
				height,
			);

			// Calculate new viewport position to center at target point
			const viewportWidth = containerWidth / zoom;
			const viewportHeight = containerHeight / zoom;

			const newViewportX = canvasCoords.x - viewportWidth / 2;
			const newViewportY = canvasCoords.y - viewportHeight / 2;

			// Convert back to minX, minY format
			const newMinX = newViewportX * zoom;
			const newMinY = newViewportY * zoom;

			if (onNavigate) {
				onNavigate(newMinX, newMinY);
			}
		},
		[
			isPointerDown,
			dragOffsetRatio.x,
			dragOffsetRatio.y,
			viewportRect.width,
			viewportRect.height,
			canvasBounds,
			scale,
			width,
			height,
			containerWidth,
			containerHeight,
			zoom,
			onNavigate,
		],
	);

	const handlePointerUp = useCallback(
		(e: React.PointerEvent<SVGSVGElement>) => {
			setIsPointerDown(false);
			e.currentTarget.releasePointerCapture(e.pointerId);
		},
		[],
	);

	// Render minimap items
	const miniMapItems = useMemo(() => {
		const itemData = generateMiniMapItems(
			items,
			canvasBounds,
			scale,
			width,
			height,
		);

		return itemData.map((item) => (
			<MiniMapItem
				key={item.id}
				x={item.x}
				y={item.y}
				width={item.width}
				height={item.height}
			/>
		));
	}, [items, canvasBounds, scale, width, height]);

	return (
		<MiniMapContainer width={width} height={height}>
			<MiniMapSvg
				ref={svgRef}
				width={width}
				height={height}
				viewBox={`0 0 ${width} ${height}`}
				onClick={handleClick}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
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
