// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";
import type { SvgCanvasState } from "../../types/SvgCanvasState";

// Import functions related to SvgCanvas.
import { newEventId } from "../../../utils/core/newEventId";
import { ungroupSelectedGroupsRecursive } from "../../utils/ungroupSelectedGroupsRecursive";
import { useAddHistory } from "../history/useAddHistory";

/**
 * Custom hook to handle ungroup events on the canvas.
 */
export const useUngroup = (props: SvgCanvasSubHooksProps) => {
	// Get the data change handler.
	const onDataChange = useAddHistory(props);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
		onDataChange,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback(() => {
		// Bypass references to avoid function creation in every render.
		const { setCanvasState } = refBus.current.props;
		const { onDataChange } = refBus.current;

		setCanvasState((prevState) => {
			const newItems = ungroupSelectedGroupsRecursive(prevState.items);

			// Create new state
			const newState = {
				...prevState,
				items: newItems,
				multiSelectGroup: undefined,
			} as SvgCanvasState;

			// Generate event ID and notify the data change.
			const eventId = newEventId();
			onDataChange(eventId, newState);

			return newState;
		});
	}, []);
};
