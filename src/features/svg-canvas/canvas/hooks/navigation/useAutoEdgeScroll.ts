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
import { InteractionState } from "../../types/InteractionState";

/**
 * Return type for useAutoEdgeScroll hook.
 */
export type UseAutoEdgeScrollReturn = {
	/** Function to adjust scroll position when cursor is near edges */
	autoEdgeScroll: (args: {
		cursorX: number;
		cursorY: number;
		clientX: number;
		clientY: number;
	}) => void;
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
	return canvasState.interactionState === InteractionState.Idle;
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

	// Reference to store the current client position for continuous scrolling
	const currentClientRef = useRef<{
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

	// Function to perform a single scroll action with known client coordinates
	const performScroll = useCallback(
		(
			horizontal: "left" | "right" | null,
			vertical: "top" | "bottom" | null,
			clientX: number,
			clientY: number,
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

			// Use base client coordinates without delta adjustment
			// Delta will be applied in drag handler

			// Dispatch a custom event with scroll position to notify other components
			const scrollEvent: SvgCanvasScrollEvent = {
				newMinX,
				newMinY,
				clientX,
				clientY,
				deltaX: scrollDeltaX,
				deltaY: scrollDeltaY,
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
			clientX: number,
			clientY: number,
		) => {
			// Clear existing interval if any
			clearScrollInterval();

			// Set the new directions
			lastScrollDirectionRef.current.horizontal = horizontal;
			lastScrollDirectionRef.current.vertical = vertical;

			// Set auto scrolling state to true
			setIsAutoScrolling(true);

			// Store current client positions
			currentClientRef.current.x = clientX;
			currentClientRef.current.y = clientY;

			// Use provided client coordinates directly
			const initialClientX = clientX;
			const initialClientY = clientY;

			// Perform initial scroll immediately
			performScroll(horizontal, vertical, initialClientX, initialClientY);

			// Start interval for continuous scrolling
			scrollIntervalRef.current = setInterval(() => {
				// Check if diagram is still changing before continuing
				const { canvasState } = refBus.current.props;
				if (shouldStopAutoScroll(canvasState)) {
					clearScrollInterval();
					return;
				}

				// Use stored client coordinates for continuous scrolling
				const currentClientX = currentClientRef.current.x;
				const currentClientY = currentClientRef.current.y;

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
			clientX,
			clientY,
		}: {
			cursorX: number;
			cursorY: number;
			clientX: number;
			clientY: number;
		}) => {
			const { canvasState, canvasRef } = refBus.current.props;
			const { minX, minY, zoom } = canvasState;

			if (!canvasRef) return;

			const { containerRef } = canvasRef;
			if (!containerRef.current) return;

			// Stop scrolling if diagram is not changing
			if (shouldStopAutoScroll(canvasState)) {
				clearScrollInterval();
				return;
			}

			// Get current container dimensions
			const containerRect = containerRef.current.getBoundingClientRect();
			const containerWidth = containerRect.width;
			const containerHeight = containerRect.height;

			// Update current client positions for continuous scrolling
			currentClientRef.current.x = clientX;
			currentClientRef.current.y = clientY;

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
					startScrollInterval(newHorizontal, newVertical, clientX, clientY);
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
