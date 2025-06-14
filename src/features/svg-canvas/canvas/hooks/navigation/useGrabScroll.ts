// Import React.
import { useCallback, useEffect, useRef } from "react";

// Import types.
import type { SvgCanvasScrollEvent } from "../../../types/events/SvgCanvasScrollEvent";
import type { CanvasHooksProps } from "../../SvgCanvasTypes";

// Import hooks.
import { useCtrl } from "../keyboard/useCtrl";

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
	props: CanvasHooksProps,
	onScroll: (e: SvgCanvasScrollEvent) => void,
): UseGrabScrollReturn => {
	const {
		canvasState: { minX, minY, isGrabScrolling },
		setCanvasState,
	} = props;

	// Use Ctrl key hook for grab scrolling
	const { isCtrlPressed } = useCtrl();
	const dragStartPos = useRef<{ x: number; y: number } | null>(null);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		minX,
		minY,
		isGrabScrolling,
		setCanvasState,
		onScroll,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	// Manage grab scrolling state
	useEffect(() => {
		// Bypass references to avoid function creation in every render.
		const { setCanvasState } = refBus.current;
		setCanvasState((prevState) => ({
			...prevState,
			isGrabScrollReady: isCtrlPressed,
			isGrabScrolling: prevState.isGrabScrolling && !isCtrlPressed,
		}));
		if (!isCtrlPressed) {
			dragStartPos.current = null;
		}
	}, [isCtrlPressed]);

	/**
	 * Handle the start of grab scrolling when Ctrl+pointer down
	 *
	 * @param e - Pointer event
	 * @returns true if grab scrolling was started, false otherwise
	 */
	const onGrabStart = useCallback(
		(e: React.PointerEvent<SVGSVGElement>): boolean => {
			// Check for Ctrl+drag to start grab scrolling
			if (e.ctrlKey && e.target === e.currentTarget) {
				// Bypass references to avoid function creation in every render.
				const { setCanvasState } = refBus.current;
				setCanvasState((prevState) => ({
					...prevState,
					isGrabScrolling: true,
				}));
				dragStartPos.current = { x: e.clientX, y: e.clientY };
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
			// Bypass references to avoid function creation in every render.
			const { isGrabScrolling, minX, minY, onScroll } = refBus.current;
			if (isGrabScrolling && dragStartPos.current) {
				const deltaX = e.clientX - dragStartPos.current.x;
				const deltaY = e.clientY - dragStartPos.current.y;

				// Update scroll position
				onScroll?.({
					minX: minX - deltaX,
					minY: minY - deltaY,
					clientX: e.clientX,
					clientY: e.clientY,
				});

				// Update drag start position for next move
				dragStartPos.current = { x: e.clientX, y: e.clientY };
			}
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
			if (isGrabScrolling) {
				// Bypass references to avoid function creation in every render.
				const { setCanvasState } = refBus.current;
				setCanvasState((prevState) => ({
					...prevState,
					isGrabScrolling: false,
				}));
				dragStartPos.current = null;
				e.currentTarget.releasePointerCapture(e.pointerId);
			}
		},
		[isGrabScrolling],
	);

	return {
		onGrabStart,
		onGrabMove,
		onGrabEnd,
	};
};
