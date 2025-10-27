import { useCallback, useRef, useEffect } from "react";

import { STYLE_CHANGE_EVENT_NAME } from "../../../constants/core/EventNames";
import type { DiagramStyleChangeEvent } from "../../../types/events/DiagramStyleChangeEvent";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";
import { applyFunctionRecursively } from "../../utils/applyFunctionRecursively";
import { useAddHistory } from "../history/useAddHistory";

/**
 * Custom hook to handle diagram style change events on the canvas.
 * Listens to STYLE_CHANGE_EVENT_NAME from the event bus and applies style changes.
 */
export const useOnStyleChange = (props: SvgCanvasSubHooksProps) => {
	// Get the data change handler.
	const addHistory = useAddHistory(props);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
		addHistory,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	const handleStyleChange = useCallback((e: DiagramStyleChangeEvent) => {
		// Bypass references to avoid function creation in every render.
		const {
			props: { setCanvasState },
		} = refBus.current;
		const { addHistory } = refBus.current;

		setCanvasState((prevState) => {
			// Update items with style changes.
			const items = applyFunctionRecursively(prevState.items, (item) => {
				// If the id does not match, return the original item.
				if (item.id !== e.id) return item;

				// If the id matches, update the item with the new style properties from event data.
				return { ...item, ...e.data };
			});

			// Create new state with updated items.
			let newState = {
				...prevState,
				items,
			};

			// Add history
			newState = addHistory(e.eventId, newState);

			return newState;
		});
	}, []);

	// Listen to style change events from the event bus
	useEffect(() => {
		const { eventBus } = props;

		const handleEvent = (event: Event) => {
			const customEvent = event as CustomEvent<DiagramStyleChangeEvent>;
			handleStyleChange(customEvent.detail);
		};

		eventBus.addEventListener(STYLE_CHANGE_EVENT_NAME, handleEvent);

		return () => {
			eventBus.removeEventListener(STYLE_CHANGE_EVENT_NAME, handleEvent);
		};
	}, [props, handleStyleChange]);

	return handleStyleChange;
};
