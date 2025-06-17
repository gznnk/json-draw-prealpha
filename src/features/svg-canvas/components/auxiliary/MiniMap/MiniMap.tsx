// Import React.
import { memo, useCallback, useMemo, useState } from "react";
import type React from "react";

// Imports related to this component.
import {
	calculateCombinedCanvasBounds,
	calculateDragNavigationPosition,
	calculateDragOffsetRatio,
	calculateMiniMapScale,
	calculateNavigationPosition,
	calculateCanvasViewportBounds,
	calculateMiniMapViewportIndicatorBounds,
	generateMiniMapItems,
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
	// Calculate all minimap properties in a single memoized computation for efficiency
	const { canvasBounds, scale, viewportRect } = useMemo(() => {
		const viewportBounds = calculateCanvasViewportBounds(
			minX,
			minY,
			containerWidth,
			containerHeight,
			zoom,
		);

		const bounds = calculateCombinedCanvasBounds(items, viewportBounds);
		const computedScale = calculateMiniMapScale(bounds, width, height);
		const rect = calculateMiniMapViewportIndicatorBounds(
			minX,
			minY,
			containerWidth,
			containerHeight,
			zoom,
			bounds,
			computedScale,
			width,
			height,
		);

		return {
			canvasBounds: bounds,
			scale: computedScale,
			viewportRect: rect,
		};
	}, [items, minX, minY, containerWidth, containerHeight, zoom, width, height]);

	// Create navigation parameters object to reduce dependency array size
	const navigationParams = useMemo(
		() => ({
			canvasBounds,
			scale,
			width,
			height,
			containerWidth,
			containerHeight,
			zoom,
		}),
		[canvasBounds, scale, width, height, containerWidth, containerHeight, zoom],
	);

	// Handle navigation based on click coordinates
	const handleNavigate = useCallback(
		(clientX: number, clientY: number, svgElement: SVGSVGElement) => {
			if (!onNavigate) return;

			const { minX: newMinX, minY: newMinY } = calculateNavigationPosition(
				clientX,
				clientY,
				svgElement,
				navigationParams.canvasBounds,
				navigationParams.scale,
				navigationParams.width,
				navigationParams.height,
				navigationParams.containerWidth,
				navigationParams.containerHeight,
				navigationParams.zoom,
			);

			onNavigate(newMinX, newMinY);
		},
		[onNavigate, navigationParams],
	);

	// State management for drag operations
	const [dragOffsetRatio, setDragOffsetRatio] = useState({ x: 0, y: 0 });
	const [isViewportInteraction, setIsViewportInteraction] = useState(false);

	// Click handler for minimap navigation
	const handleClick = useCallback(
		(e: React.MouseEvent<SVGSVGElement>) => {
			// Navigate to the clicked position
			handleNavigate(e.clientX, e.clientY, e.currentTarget);
		},
		[handleNavigate],
	);

	// ViewportIndicator event handlers
	const handleViewportPointerDown = useCallback(
		(e: React.PointerEvent<SVGRectElement>) => {
			setIsViewportInteraction(true);
			e.currentTarget.setPointerCapture(e.pointerId);

			// Calculate relative position within viewport using pure function
			const svgElement = e.currentTarget.ownerSVGElement;
			if (!svgElement) return;

			const offsetRatio = calculateDragOffsetRatio(
				e.clientX,
				e.clientY,
				svgElement,
				viewportRect,
			);
			setDragOffsetRatio(offsetRatio);
		},
		[viewportRect],
	);

	// Handle pointer move event to update viewport position
	const handleViewportPointerMove = useCallback(
		(e: React.PointerEvent<SVGRectElement>) => {
			if (!isViewportInteraction) return;

			const svgElement = e.currentTarget.ownerSVGElement;
			if (!svgElement) return;

			// Calculate new navigation position using pure function
			const { minX: newMinX, minY: newMinY } = calculateDragNavigationPosition(
				e.clientX,
				e.clientY,
				svgElement,
				dragOffsetRatio,
				viewportRect,
				navigationParams.canvasBounds,
				navigationParams.scale,
				navigationParams.width,
				navigationParams.height,
				navigationParams.containerWidth,
				navigationParams.containerHeight,
				navigationParams.zoom,
			);

			if (onNavigate) {
				onNavigate(newMinX, newMinY);
			}
		},
		[
			isViewportInteraction,
			dragOffsetRatio,
			viewportRect,
			navigationParams,
			onNavigate,
		],
	);

	// Handle pointer up event to release interaction state
	const handleViewportPointerUp = useCallback(
		(e: React.PointerEvent<SVGRectElement>) => {
			// Reset interaction state
			setIsViewportInteraction(false);

			// Release pointer capture from the ViewportIndicator element
			e.currentTarget.releasePointerCapture(e.pointerId);
		},
		[],
	);

	// Prevent click events on the viewport to avoid triggering navigation
	const handleViewportClick = useCallback(
		(e: React.MouseEvent<SVGRectElement>) => {
			// Prevent click from propagating to the SVG
			e.stopPropagation();
		},
		[],
	);

	// Generate minimap items for rendering
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
					onPointerDown={handleViewportPointerDown}
					onPointerMove={handleViewportPointerMove}
					onPointerUp={handleViewportPointerUp}
					onClick={handleViewportClick}
				/>
			</MiniMapSvg>
		</MiniMapContainer>
	);
};

export const MiniMap = memo(MiniMapComponent);
