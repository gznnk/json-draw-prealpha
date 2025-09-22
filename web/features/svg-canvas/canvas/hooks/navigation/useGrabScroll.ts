import { useCallback, useRef } from "react";

import { EVENT_NAME_SVG_CANVAS_SCROLL } from "../../../constants/core/EventNames";
import type { SvgCanvasScrollEvent } from "../../../types/events/SvgCanvasScrollEvent";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";

/**
 * Return type for the useGrabScroll hook
 */
type UseGrabScrollReturn = {
	onGrabStart: (e: React.PointerEvent<SVGSVGElement>) => boolean;
	onGrabMove: (e: React.PointerEvent<SVGSVGElement>) => void;
	onGrabEnd: (e: React.PointerEvent<SVGSVGElement>) => void;
};

/**
 * Custom hook for handling Ctrl+drag grab scrolling functionality
 *
 * @param props - Configuration options for grab scrolling
 * @returns Object containing Ctrl state, drag state, and event handlers
 */
export const useGrabScroll = (
	props: SvgCanvasSubHooksProps,
): UseGrabScrollReturn => {
	const {
		canvasState: { minX, minY, grabScrollState },
		setCanvasState,
		eventBus,
	} = props;

	// Reference to store the initial drag start state
	const dragStartState = useRef<{
		clientX: number;
		clientY: number;
		minX: number;
		minY: number;
	} | null>(null);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		minX,
		minY,
		isGrabScrolling: grabScrollState?.isGrabScrolling,
		setCanvasState,
		eventBus,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	/**
	 * Handle the start of grab scrolling when Ctrl+pointer down
	 *
	 * @param e - Pointer event
	 * @returns true if grab scrolling was started, false otherwise
	 */
	const onGrabStart = useCallback(
		(e: React.PointerEvent<SVGSVGElement>): boolean => {
			// Bypass references to avoid function creation in every render.
			const { setCanvasState, minX, minY } = refBus.current;

			// Reset the drag start state if already set
			setCanvasState((prevState) => ({
				...prevState,
				grabScrollState: {
					isGrabScrolling: false,
					grabScrollOccurred: false,
				},
			}));

			// Check for right click and if the target is the SVG element
			if (e.button === 2 && e.target === e.currentTarget) {
				// Store the initial drag start state
				dragStartState.current = {
					clientX: e.clientX,
					clientY: e.clientY,
					minX,
					minY,
				};

				// Capture the pointer to keep receiving events
				e.currentTarget.setPointerCapture(e.pointerId);
				e.preventDefault();
				return true;
			}
			return false;
		},
		[],
	);

	/**
	 * Handle grab scrolling movement
	 *
	 * @param e - Pointer event
	 */
	const onGrabMove = useCallback(
		(e: React.PointerEvent<SVGSVGElement>): void => {
			// If drag start state is not set, do nothing
			if (!dragStartState.current) return;

			// Bypass references to avoid function creation in every render.
			const { setCanvasState, eventBus } = refBus.current;

			// Calculate total movement from the start position
			const totalDeltaX = e.clientX - dragStartState.current.clientX;
			const totalDeltaY = e.clientY - dragStartState.current.clientY;

			// Calculate new scroll position from the initial canvas position
			const newMinX = dragStartState.current.minX - totalDeltaX;
			const newMinY = dragStartState.current.minY - totalDeltaY;

			// Mark that grab scrolling occurred
			setCanvasState((prevState) => ({
				...prevState,
				minX: newMinX,
				minY: newMinY,
				grabScrollState: {
					isGrabScrolling: true,
					grabScrollOccurred: true,
				},
			}));

			// Emit scroll event for other components to handle
			const scrollEvent: SvgCanvasScrollEvent = {
				newMinX,
				newMinY,
				clientX: e.clientX,
				clientY: e.clientY,
				deltaX: -totalDeltaX,
				deltaY: -totalDeltaY,
			};
			eventBus.dispatchEvent(
				new CustomEvent(EVENT_NAME_SVG_CANVAS_SCROLL, {
					detail: scrollEvent,
				}),
			);
		},
		[],
	);

	/**
	 * Handle the end of grab scrolling
	 *
	 * @param e - Pointer event
	 */
	const onGrabEnd = useCallback(
		(e: React.PointerEvent<SVGSVGElement>): void => {
			// If grab scrolling is active, reset the state
			if (refBus.current.isGrabScrolling) {
				// Bypass references to avoid function creation in every render.
				const { setCanvasState } = refBus.current;

				setCanvasState((prevState) => ({
					...prevState,
					grabScrollState: {
						isGrabScrolling: false,
						grabScrollOccurred: true,
					},
				}));
			}

			// Reset drag start state
			dragStartState.current = null;
			e.currentTarget.releasePointerCapture(e.pointerId);
		},
		[],
	);

	return {
		onGrabStart,
		onGrabMove,
		onGrabEnd,
	};
};
