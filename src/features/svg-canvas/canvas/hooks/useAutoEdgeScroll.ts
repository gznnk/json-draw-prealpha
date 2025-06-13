// Import React.
import { useCallback, useEffect, useRef } from "react";

// Import types related to SvgCanvas.
import {
	type SvgCanvasScrollEvent,
	SVG_CANVAS_SCROLL_EVENT_NAME,
} from "../../types/events/SvgCanvasScrollEvent";
import {
	AUTO_SCROLL_INTERVAL_MS,
	AUTO_SCROLL_STEP_SIZE,
	AUTO_SCROLL_THRESHOLD,
} from "../SvgCanvasConstants";
import type { CanvasHooksProps } from "../SvgCanvasTypes";

/**
 * Type definition for scroll directions.
 */
type ScrollDirection = "left" | "top" | "right" | "bottom";

/**
 * Custom hook to handle auto edge scrolling when cursor approaches canvas boundaries.
 *
 * @param props - Canvas hook props including canvas state and setter
 * @returns Function to adjust scroll position when cursor is near edges
 */
export const useAutoEdgeScroll = (props: CanvasHooksProps) => {
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
		direction: ScrollDirection | null;
	}>({ direction: null });

	// Reference to store the current cursor position for continuous scrolling
	const currentCursorRef = useRef<{
		x: number;
		y: number;
	}>({ x: 0, y: 0 });

	// Function to clear the scroll interval
	const clearScrollInterval = useCallback(() => {
		if (scrollIntervalRef.current) {
			clearInterval(scrollIntervalRef.current);
			scrollIntervalRef.current = null;
			lastScrollDirectionRef.current.direction = null;
		}
	}, []);

	// Function to perform a single scroll action with known base client coordinates
	const performScroll = useCallback(
		(direction: ScrollDirection, baseClientX: number, baseClientY: number) => {
			const { canvasState, setCanvasState } = refBus.current.props;
			const { minX, minY, zoom } = canvasState;

			// Calculate zoom-adjusted scroll step for consistent scrolling behavior
			const adjustedScrollStep = AUTO_SCROLL_STEP_SIZE * zoom;

			let newMinX = minX;
			let newMinY = minY;
			let scrollDeltaX = 0;
			let scrollDeltaY = 0;

			switch (direction) {
				case "left":
					scrollDeltaX = -adjustedScrollStep;
					newMinX = minX + scrollDeltaX;
					setCanvasState((prevState) => ({
						...prevState,
						minX: newMinX,
					}));
					break;
				case "top":
					scrollDeltaY = -adjustedScrollStep;
					newMinY = minY + scrollDeltaY;
					setCanvasState((prevState) => ({
						...prevState,
						minY: newMinY,
					}));
					break;
				case "right":
					scrollDeltaX = adjustedScrollStep;
					newMinX = minX + scrollDeltaX;
					setCanvasState((prevState) => ({
						...prevState,
						minX: newMinX,
					}));
					break;
				case "bottom":
					scrollDeltaY = adjustedScrollStep;
					newMinY = minY + scrollDeltaY;
					setCanvasState((prevState) => ({
						...prevState,
						minY: newMinY,
					}));
					break;
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
			};

			document.dispatchEvent(
				new CustomEvent(SVG_CANVAS_SCROLL_EVENT_NAME, {
					bubbles: true,
					detail: scrollEvent,
				}),
			);
		},
		[],
	);

	// Function to start continuous scrolling
	const startScrollInterval = useCallback(
		(direction: ScrollDirection, cursorX: number, cursorY: number) => {
			// Clear existing interval if any
			clearScrollInterval();

			// Set the new direction
			lastScrollDirectionRef.current.direction = direction;

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
			performScroll(direction, baseClientX, baseClientY);

			// Start interval for continuous scrolling
			scrollIntervalRef.current = setInterval(() => {
				// Check if diagram is still changing before continuing
				const { canvasState } = refBus.current.props;
				if (!canvasState.isDiagramChanging) {
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
				performScroll(direction, currentClientX, currentClientY);
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

	return useCallback(
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
			const viewBoxX = minX * zoom;
			const viewBoxY = minY * zoom;
			const viewBoxWidth = containerWidth * zoom;
			const viewBoxHeight = containerHeight * zoom;

			// Calculate distances from each edge in viewBox coordinates
			const distFromLeft = cursorX - viewBoxX;
			const distFromTop = cursorY - viewBoxY;
			const distFromRight = viewBoxX + viewBoxWidth - cursorX;
			const distFromBottom = viewBoxY + viewBoxHeight - cursorY; // Determine which edge the cursor is closest to
			let newDirection: ScrollDirection | null = null;

			// Calculate zoom-adjusted threshold for more consistent behavior across zoom levels
			const adjustedThreshold = AUTO_SCROLL_THRESHOLD * zoom;

			// Left edge scroll adjustment
			if (distFromLeft < adjustedThreshold) {
				newDirection = "left";
			}
			// Top edge scroll adjustment
			else if (distFromTop < adjustedThreshold) {
				newDirection = "top";
			}
			// Right edge scroll adjustment
			else if (distFromRight < adjustedThreshold) {
				newDirection = "right";
			}
			// Bottom edge scroll adjustment
			else if (distFromBottom < adjustedThreshold) {
				newDirection = "bottom";
			}
			// Handle direction changes
			if (newDirection !== lastScrollDirectionRef.current.direction) {
				if (newDirection === null) {
					// Cursor moved away from edge, stop scrolling
					clearScrollInterval();
				} else {
					// Cursor moved to a different edge or started near an edge
					startScrollInterval(newDirection, cursorX, cursorY);
				}
			}
		},
		[clearScrollInterval, startScrollInterval],
	);
};
