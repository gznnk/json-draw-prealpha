// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import {
	CANVAS_EXPANSION_SIZE,
	CANVAS_EXPANSION_THRESHOLD,
} from "../SvgCanvasConstants";
import type { CanvasHooksProps } from "../SvgCanvasTypes";

/**
 * Custom hook to handle scroll adjustments when cursor approaches canvas boundaries.
 *
 * @param props - Canvas hook props including canvas state and setter
 * @returns Function to adjust scroll position when cursor is near edges
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
				canvasState: { minX, minY },
				canvasRef,
				setCanvasState,
			} = refBus.current.props;

			if (!canvasRef) return;

			const { containerRef } = canvasRef;
			if (!containerRef.current) return;

			// Get current container dimensions
			const containerRect = containerRef.current.getBoundingClientRect();
			const containerWidth = containerRect.width;
			const containerHeight = containerRect.height;

			// Calculate distances from each edge in SVG coordinates
			const distFromLeft = cursorX - minX;
			const distFromTop = cursorY - minY;
			const distFromRight = minX + containerWidth - cursorX;
			const distFromBottom = minY + containerHeight - cursorY;

			// Left edge scroll adjustment
			if (distFromLeft < CANVAS_EXPANSION_THRESHOLD) {
				// Update state with new scroll position
				setCanvasState((prevState) => ({
					...prevState,
					minX: minX - CANVAS_EXPANSION_SIZE,
				}));
			}
			// Top edge scroll adjustment
			else if (distFromTop < CANVAS_EXPANSION_THRESHOLD) {
				// Update state with new scroll position
				setCanvasState((prevState) => ({
					...prevState,
					minY: minY - CANVAS_EXPANSION_SIZE,
				}));
			}
			// Right edge scroll adjustment
			else if (distFromRight < CANVAS_EXPANSION_THRESHOLD) {
				// Expand the canvas area to the right by adjusting scroll
				setCanvasState((prevState) => ({
					...prevState,
					minX: minX + CANVAS_EXPANSION_SIZE,
				}));
			}
			// Bottom edge scroll adjustment
			else if (distFromBottom < CANVAS_EXPANSION_THRESHOLD) {
				// Expand the canvas area downward by adjusting scroll
				setCanvasState((prevState) => ({
					...prevState,
					minY: minY + CANVAS_EXPANSION_SIZE,
				}));
			}
		},
		[],
	);
};
