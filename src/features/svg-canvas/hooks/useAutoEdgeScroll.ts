// Import React.
import { useCallback, useRef } from "react";

// Import constants.
import { AUTO_SCROLL_INTERVAL_MS } from "../constants/core/Constants";

// Import types.
import type { SvgViewport } from "../types/core/SvgViewport";
import type { Point } from "../types/core/Point";

// Import utils.
import { detectEdgeProximity } from "../utils/math/geometry/detectEdgeProximity";
import { calculateScrollDelta } from "../utils/math/geometry/calculateScrollDelta";

/**
 * Type for edge scroll state.
 */
export type EdgeScrollState = {
	cursorPos: Point;
	delta: Point;
};

/**
 * Type for the function to start edge scrolling.
 */
export type DoStartEdgeScrollArgs = EdgeScrollState & {
	minX: number;
	minY: number;
};

/**
 * Custom hook to handle auto edge scrolling in the SVG canvas.
 * @param viewport - The current SVG viewport.
 * @param doStartEdgeScroll - Function to start edge scrolling with new state.
 */
export const useAutoEdgeScroll = (
	viewport: SvgViewport,
	doStartEdgeScroll: (state: DoStartEdgeScrollArgs) => void,
) => {
	// Internal state for edge scrolling
	const scrollIntervalRef = useRef<number | null>(null);
	const isScrollingRef = useRef(false);

	// Internal state for edge scrolling
	const edgeScrollStateRef = useRef<EdgeScrollState>({
		cursorPos: { x: 0, y: 0 },
		delta: { x: 0, y: 0 },
	});

	// Use ref to hold referenced values to avoid frequent handler generation
	const refBusVal = {
		viewport,
		doStartEdgeScroll,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	/**
	 * Clear the edge scroll interval if it exists
	 */
	const clearEdgeScroll = useCallback(() => {
		if (scrollIntervalRef.current) {
			clearInterval(scrollIntervalRef.current);
			scrollIntervalRef.current = null;
			isScrollingRef.current = false;
		}

		return () => {
			clearEdgeScroll();
		};
	}, []);

	/**
	 * Start edge scrolling with calculated delta values
	 */
	const startEdgeScroll = useCallback(() => {
		// Mark scrolling as active
		isScrollingRef.current = true;

		// Execute scroll processing immediately
		const executeScroll = () => {
			// Bypass references to avoid function creation in every render.
			const { viewport, doStartEdgeScroll } = refBus.current;

			// Auto edge scroll if the cursor is near the edges.
			const zoom = viewport.zoom;
			const minX = viewport.minX;
			const minY = viewport.minY;

			const { cursorPos, delta } = edgeScrollStateRef.current;
			const deltaX = delta.x / zoom;
			const deltaY = delta.y / zoom;

			const newCursorPos = {
				x: cursorPos.x + deltaX,
				y: cursorPos.y + deltaY,
			};

			// Update edgeScrollStateRef
			edgeScrollStateRef.current = {
				cursorPos: newCursorPos,
				delta,
			};

			// Calculate new scroll positions
			const newMinX = minX + delta.x;
			const newMinY = minY + delta.y;

			doStartEdgeScroll({
				cursorPos: newCursorPos,
				delta: { x: deltaX, y: deltaY },
				minX: newMinX,
				minY: newMinY,
			});
		};

		// Execute immediately
		executeScroll();

		// Continue with interval
		scrollIntervalRef.current = window.setInterval(
			executeScroll,
			AUTO_SCROLL_INTERVAL_MS,
		);
	}, []);

	/**
	 * Auto edge scroll handler
	 * @param cursorPos - The current cursor position
	 * @return {boolean} - Returns true if auto edge scrolling was triggered, false otherwise.
	 */
	const autoEdgeScroll = useCallback(
		(cursorPos: Point): boolean => {
			// Auto edge scroll if the cursor is near the edges.
			const { x: cursorX, y: cursorY } = cursorPos;

			// Check edge proximity using shared function
			const edgeProximity = detectEdgeProximity(viewport, cursorX, cursorY);

			if (!edgeProximity.isNearEdge) {
				// Cursor moved away from all edges, stop scrolling
				clearEdgeScroll();
				return false;
			}

			// Calculate scroll delta and update edge scroll state atomically
			const { deltaX, deltaY } = calculateScrollDelta(
				edgeProximity.horizontal,
				edgeProximity.vertical,
			);
			edgeScrollStateRef.current = {
				cursorPos,
				delta: { x: deltaX, y: deltaY },
			};
			if (!isScrollingRef.current) {
				// Cursor moved to a different edge or started near an edge
				startEdgeScroll();
			}
			return true;
		},
		[viewport, startEdgeScroll, clearEdgeScroll],
	);

	return {
		autoEdgeScroll,
		clearEdgeScroll,
	};
};
