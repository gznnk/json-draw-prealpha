// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import {
	CANVAS_EXPANSION_SIZE,
	CANVAS_EXPANSION_THRESHOLD,
} from "../SvgCanvasConstants";
import type { CanvasHooksProps } from "../SvgCanvasTypes";

/**
 * Custom hook to risze the canvas when cursor approaches boundaries.
 *
 * @param props - Canvas hook props including canvas state and setter
 * @returns Function to resize canvas and directly modify canvas DOM attributes
 */
export const useCanvasResize = (props: CanvasHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback(
		({
			cursorX,
			cursorY,
		}: {
			cursorX: number;
			cursorY: number;
		}) => {
			const {
				canvasState: { minX, minY, width, height },
				canvasRef,
				setCanvasState,
			} = refBus.current.props;

			if (!canvasRef) return;

			const { containerRef, svgRef } = canvasRef;

			// Calculate distances from each edge in SVG coordinates
			const distFromLeft = cursorX - minX;
			const distFromTop = cursorY - minY;
			const distFromRight = minX + width - cursorX;
			const distFromBottom = minY + height - cursorY;

			// Left edge expansion
			if (distFromLeft < CANVAS_EXPANSION_THRESHOLD) {
				if (containerRef.current && svgRef.current) {
					// Calculate new dimensions
					const newMinX = minX - CANVAS_EXPANSION_SIZE;
					const newWidth = width + (minX - newMinX);

					// Update state for component re-renders
					setCanvasState((prevState) => ({
						...prevState,
						minX: newMinX,
						width: newWidth,
					}));

					// Direct DOM manipulation for immediate visual feedback
					svgRef.current.setAttribute("width", `${newWidth}`);
					svgRef.current.setAttribute(
						"viewBox",
						`${newMinX} ${minY} ${newWidth} ${height}`,
					);

					// Maintain scroll position relative to content
					containerRef.current.scrollLeft = CANVAS_EXPANSION_SIZE;
				}
			}
			// Top edge expansion
			else if (distFromTop < CANVAS_EXPANSION_THRESHOLD) {
				if (containerRef.current && svgRef.current) {
					// Calculate new dimensions
					const newMinY = minY - CANVAS_EXPANSION_SIZE;
					const newHeight = height + (minY - newMinY);

					// Update state for component re-renders
					setCanvasState((prevState) => ({
						...prevState,
						minY: newMinY,
						height: newHeight,
					}));

					// Direct DOM manipulation for immediate visual feedback
					svgRef.current.setAttribute("height", `${newHeight}`);
					svgRef.current.setAttribute(
						"viewBox",
						`${minX} ${newMinY} ${width} ${newHeight}`,
					);

					// Maintain scroll position relative to content
					containerRef.current.scrollTop = CANVAS_EXPANSION_SIZE;
				}
			}
			// Right edge expansion
			else if (distFromRight < CANVAS_EXPANSION_THRESHOLD) {
				// Simple width increase without scroll adjustment needed
				setCanvasState((prevState) => ({
					...prevState,
					width: width + CANVAS_EXPANSION_SIZE,
				}));
			}
			// Bottom edge expansion
			else if (distFromBottom < CANVAS_EXPANSION_THRESHOLD) {
				// Simple height increase without scroll adjustment needed
				setCanvasState((prevState) => ({
					...prevState,
					height: height + CANVAS_EXPANSION_SIZE,
				}));
			}
		},
		[],
	);
};
