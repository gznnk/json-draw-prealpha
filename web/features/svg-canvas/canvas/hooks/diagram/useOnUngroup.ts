import { useRef, useEffect } from "react";

import { UNGROUP_EVENT_NAME } from "../../../constants/core/EventNames";
import type { UngroupEvent } from "../../../types/events/UngroupEvent";
import { newEventId } from "../../../utils/core/newEventId";
import type { SvgCanvasState } from "../../types/SvgCanvasState";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";
import { clearSelectionRecursively } from "../../utils/clearSelectionRecursively";
import { ungroupSelectedGroupsRecursively } from "../../utils/ungroupSelectedGroupsRecursively";
import { useAddHistory } from "../history/useAddHistory";

/**
 * Custom hook to handle ungroup events on the canvas.
 * Listens to UNGROUP_EVENT_NAME from the event bus and applies ungroup operations.
 */
export const useOnUngroup = (props: SvgCanvasSubHooksProps) => {
	const { eventBus, setCanvasState } = props;

	// Get the data change handler.
	const addHistory = useAddHistory(props);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		eventBus,
		setCanvasState,
		addHistory,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	// Listen to ungroup events from the event bus
	useEffect(() => {
		const { eventBus } = refBus.current;

		const handleEvent = (event: Event) => {
			const customEvent = event as CustomEvent<UngroupEvent>;
			const e = customEvent.detail;

			// Bypass references to avoid function creation in every render.
			const { setCanvasState, addHistory } = refBus.current;

			setCanvasState((prevState) => {
				let newItems = ungroupSelectedGroupsRecursively(prevState.items);
				newItems = clearSelectionRecursively(newItems);

				// Create new state
				const eventId = e.eventId ?? newEventId();
				let newState = {
					...prevState,
					items: newItems,
					multiSelectGroup: undefined,
				} as SvgCanvasState;

				// Add history
				newState = addHistory(eventId, newState);

				return newState;
			});
		};

		eventBus.addEventListener(UNGROUP_EVENT_NAME, handleEvent);

		return () => {
			eventBus.removeEventListener(UNGROUP_EVENT_NAME, handleEvent);
		};
	}, []);
};
