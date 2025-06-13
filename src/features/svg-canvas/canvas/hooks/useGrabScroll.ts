import { useCallback, useEffect, useRef, useState } from "react";

import { useCtrl } from "./useCtrl";

/**
 * Props for the useGrabScroll hook
 */
type UseGrabScrollProps = {
	minX: number;
	minY: number;
	onScroll?: (params: {
		minX: number;
		minY: number;
		clientX: number;
		clientY: number;
	}) => void;
};

/**
 * Return type for the useGrabScroll hook
 */
type UseGrabScrollReturn = {
	isGrabScrollReady: boolean;
	isGrabScrolling: boolean;
	handleGrabStart: (e: React.PointerEvent<SVGSVGElement>) => boolean;
	handleGrabMove: (e: React.PointerEvent<SVGSVGElement>) => void;
	handleGrabEnd: (e: React.PointerEvent<SVGSVGElement>) => void;
};

/**
 * Custom hook for handling Ctrl+drag grab scrolling functionality
 *
 * @param props - Configuration options for grab scrolling
 * @returns Object containing Ctrl state, drag state, and event handlers
 */
export const useGrabScroll = (
	props: UseGrabScrollProps,
): UseGrabScrollReturn => {
	const { minX, minY, onScroll } = props;

	// Use Ctrl key hook for grab scrolling
	const { isCtrlPressed } = useCtrl();
	const [isGrabScrolling, setIsGrabScrolling] = useState(false);
	const dragStartPos = useRef<{ x: number; y: number } | null>(null);

	// End dragging if Ctrl is released during drag
	useEffect(() => {
		if (!isCtrlPressed && isGrabScrolling) {
			setIsGrabScrolling(false);
			dragStartPos.current = null;
		}
	}, [isCtrlPressed, isGrabScrolling]);

	/**
	 * Handle the start of grab scrolling when Ctrl+pointer down
	 *
	 * @param e - Pointer event
	 * @returns true if grab scrolling was started, false otherwise
	 */
	const handleGrabStart = useCallback(
		(e: React.PointerEvent<SVGSVGElement>): boolean => {
			// Check for Ctrl+drag to start grab scrolling
			if (e.ctrlKey && e.target === e.currentTarget) {
				setIsGrabScrolling(true);
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
	const handleGrabMove = useCallback(
		(e: React.PointerEvent<SVGSVGElement>): void => {
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
		[isGrabScrolling, minX, minY, onScroll],
	);

	/**
	 * Handle the end of grab scrolling
	 *
	 * @param e - Pointer event
	 */
	const handleGrabEnd = useCallback(
		(e: React.PointerEvent<SVGSVGElement>): void => {
			if (isGrabScrolling) {
				setIsGrabScrolling(false);
				dragStartPos.current = null;
				e.currentTarget.releasePointerCapture(e.pointerId);
			}
		},
		[isGrabScrolling],
	);

	return {
		isGrabScrollReady: isCtrlPressed,
		isGrabScrolling,
		handleGrabStart,
		handleGrabMove,
		handleGrabEnd,
	};
};
