// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import {
	CANVAS_EXPANSION_SIZE,
	CANVAS_EXPANSION_THRESHOLD,
} from "../SvgCanvasConstants";
import type { CanvasHooksProps } from "../SvgCanvasTypes";

/**
 * Custom hook to handle canvas resize events on the canvas.
 *
 * @param props - Canvas hook props including canvas state and setter
 * @returns Function to process canvas resize events and directly resize canvas
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

			// Calculate distance from each edge in SVG coordinates
			const distFromLeft = cursorX - minX;
			const distFromTop = cursorY - minY;
			const distFromRight = minX + width - cursorX;
			const distFromBottom = minY + height - cursorY;

			// Check if cursor is near the left edge
			if (distFromLeft < CANVAS_EXPANSION_THRESHOLD) {
				if (containerRef.current && svgRef.current) {
					// Expand canvas to the left
					const newMinX = minX - CANVAS_EXPANSION_SIZE;
					const newWidth = width + (minX - newMinX);

					// Execute the resize function to update the canvas state
					setCanvasState((prevState) => ({
						...prevState,
						minX: newMinX,
						width: newWidth,
					}));

					// Update SVG viewBox directly to prevent rendering issues
					svgRef.current.setAttribute("width", `${newWidth}`);
					svgRef.current.setAttribute(
						"viewBox",
						`${newMinX} ${minY} ${newWidth} ${height}`,
					);

					// Adjust scroll position to keep cursor at the same visual position
					containerRef.current.scrollLeft = CANVAS_EXPANSION_SIZE;
				}
			}
			// Check if cursor is near the top edge
			else if (distFromTop < CANVAS_EXPANSION_THRESHOLD) {
				if (containerRef.current && svgRef.current) {
					// Expand canvas upward
					const newMinY = minY - CANVAS_EXPANSION_SIZE;
					const newHeight = height + (minY - newMinY);

					// Execute the resize function to update the canvas state
					setCanvasState((prevState) => ({
						...prevState,
						minY: newMinY,
						height: newHeight,
					}));

					// Update SVG viewBox directly to prevent rendering issues
					svgRef.current.setAttribute("height", `${newHeight}`);
					svgRef.current.setAttribute(
						"viewBox",
						`${minX} ${newMinY} ${width} ${newHeight}`,
					);

					// Adjust scroll position to keep cursor at the same visual position
					containerRef.current.scrollTop = CANVAS_EXPANSION_SIZE;
				}
			}
			// Check if cursor is near the right edge
			else if (distFromRight < CANVAS_EXPANSION_THRESHOLD) {
				// Expand canvas to the right
				setCanvasState((prevState) => ({
					...prevState,
					width: width + CANVAS_EXPANSION_SIZE,
				}));
			}
			// Check if cursor is near the bottom edge
			else if (distFromBottom < CANVAS_EXPANSION_THRESHOLD) {
				// Expand canvas downward
				setCanvasState((prevState) => ({
					...prevState,
					height: height + CANVAS_EXPANSION_SIZE,
				}));
			}
		},
		[],
	);
};
