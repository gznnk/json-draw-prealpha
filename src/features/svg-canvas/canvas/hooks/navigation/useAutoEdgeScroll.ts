// Import React.
import { useCallback, useEffect, useRef, useState } from "react";

// Import types related to SvgCanvas.
import type { SvgCanvasScrollEvent } from "../../../types/events/SvgCanvasScrollEvent";
import { EVENT_NAME_SVG_CANVAS_SCROLL } from "../../../constants/EventNames";

import {
	AUTO_SCROLL_INTERVAL_MS,
	AUTO_SCROLL_STEP_SIZE,
	AUTO_SCROLL_THRESHOLD,
} from "../../SvgCanvasConstants";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";
import type { SvgCanvasState } from "../../types/SvgCanvasState";

/**
 * Return type for useAutoEdgeScroll hook.
 */
export type UseAutoEdgeScrollReturn = {
	/** Function to adjust scroll position when cursor is near edges */
	autoEdgeScroll: (args: { cursorX: number; cursorY: number }) => void;
	/** Flag indicating whether auto edge scroll is currently active */
	isAutoScrolling: boolean;
};

/**
 * Determines if auto scrolling should be stopped based on canvas state.
 *
 * @param canvasState - Current canvas state
 * @returns true if auto scrolling should stop, false otherwise
 */
const shouldStopAutoScroll = (canvasState: SvgCanvasState): boolean => {
	return !canvasState.isDiagramChanging;
};

/**
 * Custom hook to handle auto edge scrolling when cursor approaches canvas boundaries.
 *
 * @param props - Canvas hook props including canvas state and setter
 * @returns Object containing auto scroll function and current scrolling state
 */
export const useAutoEdgeScroll = (
	props: SvgCanvasSubHooksProps,
): UseAutoEdgeScrollReturn => {
	const { eventBus } = props;

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	// Reference to store the current scroll interval ID
	const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
	// Reference to store the last scroll direction for continuous scrolling
	const lastScrollDirectionRef = useRef<{
		horizontal: "left" | "right" | null;
		vertical: "top" | "bottom" | null;
	}>({ horizontal: null, vertical: null });

	// Reference to store the current cursor position for continuous scrolling
	const currentCursorRef = useRef<{
		x: number;
		y: number;
	}>({ x: 0, y: 0 });

	// State to track if auto scrolling is currently active
	const [isAutoScrolling, setIsAutoScrolling] = useState(false);

	// Function to clear the scroll interval
	const clearScrollInterval = useCallback(() => {
		if (scrollIntervalRef.current) {
			clearInterval(scrollIntervalRef.current);
			scrollIntervalRef.current = null;
			lastScrollDirectionRef.current.horizontal = null;
			lastScrollDirectionRef.current.vertical = null;
			setIsAutoScrolling(false);
		}
	}, []);

	// Function to perform a single scroll action with known base client coordinates
	const performScroll = useCallback(
		(
			horizontal: "left" | "right" | null,
			vertical: "top" | "bottom" | null,
			baseClientX: number,
			baseClientY: number,
		) => {
			const { canvasState } = refBus.current.props;
			const { minX, minY } = canvasState;

			let newMinX = minX;
			let newMinY = minY;
			let scrollDeltaX = 0;
			let scrollDeltaY = 0;

			// Handle horizontal scrolling
			if (horizontal === "left") {
				scrollDeltaX = -AUTO_SCROLL_STEP_SIZE;
				newMinX = minX + scrollDeltaX;
			} else if (horizontal === "right") {
				scrollDeltaX = AUTO_SCROLL_STEP_SIZE;
				newMinX = minX + scrollDeltaX;
			}

			// Handle vertical scrolling
			if (vertical === "top") {
				scrollDeltaY = -AUTO_SCROLL_STEP_SIZE;
				newMinY = minY + scrollDeltaY;
			} else if (vertical === "bottom") {
				scrollDeltaY = AUTO_SCROLL_STEP_SIZE;
				newMinY = minY + scrollDeltaY;
			}

			// Calculate adjusted client coordinates by adding scroll delta
			// Similar to how handleWheel does: clientX: e.clientX + e.deltaX
			const adjustedClientX = baseClientX + scrollDeltaX;
			const adjustedClientY = baseClientY + scrollDeltaY;

			// Dispatch a custom event with scroll position to notify other components
			const scrollEvent: SvgCanvasScrollEvent = {
				minX: newMinX,
				minY: newMinY,
				clientX: adjustedClientX,
				clientY: adjustedClientY,
				isFromAutoEdgeScroll: true,
			};

			eventBus.dispatchEvent(
				new CustomEvent(EVENT_NAME_SVG_CANVAS_SCROLL, {
					detail: scrollEvent,
				}),
			);
		},
		[eventBus],
	);

	// Function to start continuous scrolling
	const startScrollInterval = useCallback(
		(
			horizontal: "left" | "right" | null,
			vertical: "top" | "bottom" | null,
			cursorX: number,
			cursorY: number,
		) => {
			// Clear existing interval if any
			clearScrollInterval();

			// Set the new directions
			lastScrollDirectionRef.current.horizontal = horizontal;
			lastScrollDirectionRef.current.vertical = vertical;

			// Set auto scrolling state to true
			setIsAutoScrolling(true);

			// Store current cursor position
			currentCursorRef.current.x = cursorX;
			currentCursorRef.current.y = cursorY;

			// Convert initial cursor position to client coordinates and store it
			let baseClientX = 0;
			let baseClientY = 0;

			const { canvasRef } = refBus.current.props;
			if (canvasRef?.svgRef?.current) {
				const svgElement = canvasRef.svgRef.current;
				const svgPoint = svgElement.createSVGPoint();
				svgPoint.x = cursorX;
				svgPoint.y = cursorY;

				const screenCTM = svgElement.getScreenCTM();
				if (screenCTM) {
					const clientPoint = svgPoint.matrixTransform(screenCTM);
					baseClientX = clientPoint.x;
					baseClientY = clientPoint.y;
				}
			}

			// Perform initial scroll immediately
			performScroll(horizontal, vertical, baseClientX, baseClientY);

			// Start interval for continuous scrolling
			scrollIntervalRef.current = setInterval(() => {
				// Check if diagram is still changing before continuing
				const { canvasState } = refBus.current.props;
				if (shouldStopAutoScroll(canvasState)) {
					clearScrollInterval();
					return;
				}

				// Get current cursor position
				const currentCursorX = currentCursorRef.current.x;
				const currentCursorY = currentCursorRef.current.y;

				// Convert current cursor position to client coordinates
				let currentClientX = 0;
				let currentClientY = 0;

				if (canvasRef?.svgRef?.current) {
					const svgElement = canvasRef.svgRef.current;
					const svgPoint = svgElement.createSVGPoint();
					svgPoint.x = currentCursorX;
					svgPoint.y = currentCursorY;

					const screenCTM = svgElement.getScreenCTM();
					if (screenCTM) {
						const clientPoint = svgPoint.matrixTransform(screenCTM);
						currentClientX = clientPoint.x;
						currentClientY = clientPoint.y;
					}
				}

				// Use current client coordinates for continuous scrolling
				performScroll(horizontal, vertical, currentClientX, currentClientY);
			}, AUTO_SCROLL_INTERVAL_MS);
		},
		[clearScrollInterval, performScroll],
	);

	// Cleanup interval on unmount
	useEffect(() => {
		return () => {
			clearScrollInterval();
		};
	}, [clearScrollInterval]);

	const autoEdgeScrollCallback = useCallback(
		({
			cursorX,
			cursorY,
		}: {
			cursorX: number;
			cursorY: number;
		}) => {
			const {
				canvasState: { minX, minY, zoom, isDiagramChanging },
				canvasRef,
			} = refBus.current.props;

			if (!canvasRef) return;

			const { containerRef } = canvasRef;
			if (!containerRef.current) return;

			// Stop scrolling if diagram is not changing
			if (!isDiagramChanging) {
				clearScrollInterval();
				return;
			}

			// Get current container dimensions
			const containerRect = containerRef.current.getBoundingClientRect();
			const containerWidth = containerRect.width;
			const containerHeight = containerRect.height;

			// Update current cursor position for continuous scrolling
			currentCursorRef.current.x = cursorX;
			currentCursorRef.current.y = cursorY;

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
			let newHorizontal: "left" | "right" | null = null;
			let newVertical: "top" | "bottom" | null = null;

			// Calculate zoom-adjusted threshold for more consistent behavior across zoom levels
			const adjustedThreshold = AUTO_SCROLL_THRESHOLD * zoom;

			// Check horizontal edges
			if (distFromLeft < adjustedThreshold) {
				newHorizontal = "left";
			} else if (distFromRight < adjustedThreshold) {
				newHorizontal = "right";
			}

			// Check vertical edges
			if (distFromTop < adjustedThreshold) {
				newVertical = "top";
			} else if (distFromBottom < adjustedThreshold) {
				newVertical = "bottom";
			}

			// Handle direction changes
			const currentHorizontal = lastScrollDirectionRef.current.horizontal;
			const currentVertical = lastScrollDirectionRef.current.vertical;

			if (
				newHorizontal !== currentHorizontal ||
				newVertical !== currentVertical
			) {
				if (newHorizontal === null && newVertical === null) {
					// Cursor moved away from all edges, stop scrolling
					clearScrollInterval();
				} else {
					// Cursor moved to a different edge or started near an edge
					startScrollInterval(newHorizontal, newVertical, cursorX, cursorY);
				}
			}
		},
		[clearScrollInterval, startScrollInterval],
	);

	return {
		autoEdgeScroll: autoEdgeScrollCallback,
		isAutoScrolling,
	};
};
