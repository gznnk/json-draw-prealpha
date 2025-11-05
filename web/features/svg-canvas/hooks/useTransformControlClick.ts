import type React from "react";
import { useEffect } from "react";

import { EVENT_NAME_TRANSFORM_CONTROL_CLICK } from "../constants/core/EventNames";
import { useEventBus } from "../context/EventBusContext";
import type { TransformControlClickEvent } from "../types/events/TransformControlClickEvent";

/**
 * Props for the useTransformControlClick hook
 */
export type UseTransformControlClickProps = {
	id: string;
	ref: React.RefObject<SVGElement>;
	onTransformControlClick?: (e: TransformControlClickEvent) => void;
};

/**
 * Custom hook to listen for transform control (DragLine/DragPoint) click events via EventBus.
 * This hook allows shape components to respond to clicks on their transform controls
 * without tight coupling to the Transformative component.
 *
 * @param props Hook props
 * @param props.id - ID of the diagram
 * @param props.ref - Reference to the SVG element for pointer-over detection
 * @param props.onTransformControlClick - Callback when transform control is clicked
 */
export const useTransformControlClick = (
	props: UseTransformControlClickProps,
) => {
	const { id, onTransformControlClick } = props;
	const eventBus = useEventBus();

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
};
