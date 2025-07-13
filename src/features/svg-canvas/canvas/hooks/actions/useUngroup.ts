// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { SvgCanvasSubHooksProps, SvgCanvasState } from "../../SvgCanvasTypes";

// Import functions related to SvgCanvas.
import { newEventId } from "../../../utils/common/newEventId";
import { addHistory } from "../../utils/addHistory";
import { ungroupSelectedGroupsRecursive } from "../../utils/ungroupSelectedGroupsRecursive";

/**
 * Custom hook to handle ungroup events on the canvas.
 */
export const useUngroup = (props: SvgCanvasSubHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback(() => {
		// Bypass references to avoid function creation in every render.
		const { setCanvasState } = refBus.current.props;

		setCanvasState((prevState) => {
			const newItems = ungroupSelectedGroupsRecursive(prevState.items);

			// Create new state
			let newState = {
				...prevState,
				items: newItems,
				multiSelectGroup: undefined,
			} as SvgCanvasState;

			// Add a new history entry.
			newState.lastHistoryEventId = newEventId();
			newState = addHistory(prevState, newState);

			return newState;
		});
	}, []);
};
