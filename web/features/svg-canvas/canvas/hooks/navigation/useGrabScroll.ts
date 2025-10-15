import { useCallback, useRef } from "react";

import {
	INERTIA_DECELERATION,
	INERTIA_MAX_VELOCITY,
	INERTIA_MIN_VELOCITY,
	INERTIA_VELOCITY_THRESHOLD,
} from "../../../constants/core/Constants";
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
		canvasState: { minX, minY, grabScrollState, zoom },
		setCanvasState,
		onPanZoomChange,
	} = props;

	// Reference to store the initial drag start state
	const dragStartState = useRef<{
		clientX: number;
		clientY: number;
		minX: number;
		minY: number;
	} | null>(null);

	// Velocity tracking for inertia scrolling
	const velocityTracker = useRef<{
		lastClientX: number;
		lastClientY: number;
		lastTime: number;
		velocityX: number;
		velocityY: number;
	} | null>(null);

	// Animation frame reference for inertia
	const inertiaAnimationFrame = useRef<number | null>(null);

	/**
	 * Start inertia scrolling animation with given initial velocity
	 *
	 * @param initialVelocityX - Initial velocity in X direction (pixels per millisecond)
	 * @param initialVelocityY - Initial velocity in Y direction (pixels per millisecond)
	 */
	const startInertiaAnimation = useCallback(
		(initialVelocityX: number, initialVelocityY: number): void => {
			let velocityX = initialVelocityX;
			let velocityY = initialVelocityY;
			let lastTime = performance.now();

			const animate = (): void => {
				const currentTime = performance.now();
				const deltaTime = currentTime - lastTime;
				lastTime = currentTime;

				// Apply deceleration
				velocityX *= INERTIA_DECELERATION;
				velocityY *= INERTIA_DECELERATION;

				// Check if we should continue animating
				if (
					Math.abs(velocityX) < INERTIA_MIN_VELOCITY &&
					Math.abs(velocityY) < INERTIA_MIN_VELOCITY
				) {
					inertiaAnimationFrame.current = null;
					return;
				}

				// Calculate scroll delta
				const deltaX = velocityX * deltaTime;
				const deltaY = velocityY * deltaTime;

				// Update canvas position
				const { setCanvasState, zoom, onPanZoomChange, minX, minY } =
					refBus.current;

				const newMinX = minX - deltaX;
				const newMinY = minY - deltaY;

				setCanvasState((prevState) => {
					const newState = {
						...prevState,
						minX: newMinX,
						minY: newMinY,
					};

					onPanZoomChange?.({
						minX: newMinX,
						minY: newMinY,
						zoom,
					});

					return newState;
				});

				// Continue animation
				inertiaAnimationFrame.current = requestAnimationFrame(animate);
			};

			// Start the animation
			inertiaAnimationFrame.current = requestAnimationFrame(animate);
		},
		[],
	);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		minX,
		minY,
		zoom,
		isGrabScrolling: grabScrollState?.isGrabScrolling,
		setCanvasState,
		onPanZoomChange,
		startInertiaAnimation,
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

			// Cancel any ongoing inertia animation
			if (inertiaAnimationFrame.current !== null) {
				cancelAnimationFrame(inertiaAnimationFrame.current);
				inertiaAnimationFrame.current = null;
			}

			// Check for right click and if the target is the SVG element
			if (e.button === 2 && e.target === e.currentTarget) {
				// Store the initial drag start state
				dragStartState.current = {
					clientX: e.clientX,
					clientY: e.clientY,
					minX,
					minY,
				};

				// Initialize velocity tracker
				velocityTracker.current = {
					lastClientX: e.clientX,
					lastClientY: e.clientY,
					lastTime: performance.now(),
					velocityX: 0,
					velocityY: 0,
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
			const { setCanvasState, zoom, onPanZoomChange } = refBus.current;

			// Update velocity tracker
			if (velocityTracker.current) {
				const currentTime = performance.now();
				const deltaTime = currentTime - velocityTracker.current.lastTime;

				if (deltaTime > 0) {
					const deltaX = e.clientX - velocityTracker.current.lastClientX;
					const deltaY = e.clientY - velocityTracker.current.lastClientY;

					// Calculate velocity in pixels per millisecond and clamp to max velocity
					const rawVelocityX = deltaX / deltaTime;
					const rawVelocityY = deltaY / deltaTime;

					velocityTracker.current.velocityX = Math.max(
						-INERTIA_MAX_VELOCITY,
						Math.min(INERTIA_MAX_VELOCITY, rawVelocityX),
					);
					velocityTracker.current.velocityY = Math.max(
						-INERTIA_MAX_VELOCITY,
						Math.min(INERTIA_MAX_VELOCITY, rawVelocityY),
					);
					velocityTracker.current.lastClientX = e.clientX;
					velocityTracker.current.lastClientY = e.clientY;
					velocityTracker.current.lastTime = currentTime;
				}
			}

			// Calculate total movement from the start position
			const totalDeltaX = e.clientX - dragStartState.current.clientX;
			const totalDeltaY = e.clientY - dragStartState.current.clientY;

			// Calculate new scroll position from the initial canvas position
			const newMinX = dragStartState.current.minX - totalDeltaX;
			const newMinY = dragStartState.current.minY - totalDeltaY;

			// Mark that grab scrolling occurred
			setCanvasState((prevState) => {
				const newState = {
					...prevState,
					minX: newMinX,
					minY: newMinY,
					grabScrollState: {
						isGrabScrolling: true,
						grabScrollOccurred: true,
					},
				};

				onPanZoomChange?.({
					minX: newMinX,
					minY: newMinY,
					zoom,
				});

				return newState;
			});
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
				const { setCanvasState, startInertiaAnimation } = refBus.current;

				setCanvasState((prevState) => ({
					...prevState,
					grabScrollState: {
						isGrabScrolling: false,
						grabScrollOccurred: true,
					},
				}));

				// Start inertia animation if there's sufficient velocity
				if (velocityTracker.current) {
					const { velocityX, velocityY } = velocityTracker.current;
					const hasVelocity =
						Math.abs(velocityX) > INERTIA_VELOCITY_THRESHOLD ||
						Math.abs(velocityY) > INERTIA_VELOCITY_THRESHOLD;

					if (hasVelocity) {
						startInertiaAnimation(velocityX, velocityY);
					}
				}
			}

			// Reset drag start state
			dragStartState.current = null;
			velocityTracker.current = null;
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
