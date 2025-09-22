import { useCallback, useRef } from "react";

import { newEventId } from "../../../utils/core/newEventId";
import type { SvgCanvasState } from "../../types/SvgCanvasState";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";
import { clearSelectionRecursively } from "../../utils/clearSelectionRecursively";
import { ungroupSelectedGroupsRecursively } from "../../utils/ungroupSelectedGroupsRecursively";
import { useAddHistory } from "../history/useAddHistory";

/**
 * Custom hook to handle ungroup events on the canvas.
 */
export const useUngroup = (props: SvgCanvasSubHooksProps) => {
	// Get the data change handler.
	const addHistory = useAddHistory(props);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
		addHistory,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback(() => {
		// Bypass references to avoid function creation in every render.
		const {
			props: { setCanvasState },
			addHistory,
		} = refBus.current;

		setCanvasState((prevState) => {
			let newItems = ungroupSelectedGroupsRecursively(prevState.items);
			newItems = clearSelectionRecursively(newItems);

			// Create new state
			let newState = {
				...prevState,
				items: newItems,
				multiSelectGroup: undefined,
			} as SvgCanvasState;

			// Generate event ID and add history
			const eventId = newEventId();
			newState = addHistory(eventId, newState);

			return newState;
		});
	}, []);
};
