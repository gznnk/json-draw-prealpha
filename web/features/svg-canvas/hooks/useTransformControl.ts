import type React from "react";
import { useCallback, useEffect, useState } from "react";

import { EVENT_NAME_TRANSFORM_CONTROL_CLICK } from "../constants/core/EventNames";
import { useEventBus } from "../context/EventBusContext";
import { useSvgCanvasState } from "../context/SvgCanvasStateContext";
import type { TransformControlClickEvent } from "../types/events/TransformControlClickEvent";

/**
 * Props for the useTransformControl hook
 */
export type UseTransformControlProps = {
	id: string;
	ref: React.RefObject<SVGElement>;
	onTransformControlClick?: (e: TransformControlClickEvent) => void;
};

/**
 * Return value from useTransformControl hook
 */
export type UseTransformControlReturn = {
	showTransformControl: boolean;
	setShowTransformControl: (show: boolean) => void;
};

/**
 * Custom hook to manage transform control visibility and handle click events via EventBus.
 * This hook allows shape components to:
 * - Control whether their Transformative component should be displayed
 * - Respond to clicks on transform controls without tight coupling
 *
 * @param props Hook props
 * @param props.id - ID of the diagram
 * @param props.ref - Reference to the SVG element for pointer-over detection
 * @param props.onTransformControlClick - Callback when transform control is clicked
 * @returns Object with showTransformControl flag and setter
 */
export const useTransformControl = (
	props: UseTransformControlProps,
): UseTransformControlReturn => {
	const { id, onTransformControlClick } = props;
	const eventBus = useEventBus();
	const canvasStateRef = useSvgCanvasState();
	const [showTransformControl, setShowTransformControlInternal] =
		useState(true);

	// Wrapper to update both local state and canvas state
	const setShowTransformControl = useCallback(
		(show: boolean) => {
			setShowTransformControlInternal(show);

			// Update canvas state's hideTransformativeForDiagramIds set
			if (canvasStateRef?.current) {
				const hideSet = canvasStateRef.current.hideTransformativeForDiagramIds;
				if (show) {
					hideSet.delete(id);
				} else {
					hideSet.add(id);
				}
			}
		},
		[id, canvasStateRef],
	);

	useEffect(() => {
		if (!onTransformControlClick) {
			return;
		}

		const handleTransformControlClick = (event: Event) => {
			const customEvent = event as CustomEvent<TransformControlClickEvent>;
			const detail = customEvent.detail;

			// Only respond to events for this diagram
			if (detail.id === id) {
				onTransformControlClick(detail);
			}
		};

		eventBus.addEventListener(
			EVENT_NAME_TRANSFORM_CONTROL_CLICK,
			handleTransformControlClick,
		);

		return () => {
			eventBus.removeEventListener(
				EVENT_NAME_TRANSFORM_CONTROL_CLICK,
				handleTransformControlClick,
			);
		};
	}, [id, onTransformControlClick, eventBus]);

	return {
		showTransformControl,
		setShowTransformControl,
	};
};
