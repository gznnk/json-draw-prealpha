// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { GroupData } from "../../../types/data/shapes/GroupData";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";
import type { SvgCanvasState } from "../../types/SvgCanvasState";

// Import functions related to SvgCanvas.
import { useDataChange } from "../history/useDataChange";
import { newId } from "../../../utils/shapes/common/newId";
import { newEventId } from "../../../utils/core/newEventId";

import { getSelectedDiagrams } from "../../../utils/core/getSelectedDiagrams";
import { removeGroupedRecursive } from "../../utils/removeGroupedRecursive";

/**
 * Custom hook to handle group events on the canvas.
 */
export const useGroup = (props: SvgCanvasSubHooksProps) => {
	// Get the data change handler.
	const onDataChange = useDataChange(props);

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
			const selectedItems = getSelectedDiagrams(prevState.items);
			if (selectedItems.length < 2) {
				// Do not group if there are less than 2 selected shapes
				// If this is reached, there is a flaw in the caller's control logic
				console.error("Invalid selection count for group.");
				return prevState;
			}

			if (!prevState.multiSelectGroup) {
				// Type checking for multiSelectGroup.
				// If this is the case, it means that the canvas state is invalid.
				console.error("Invalid multiSelectGroup state.");
				return prevState;
			}

			// Create a new group data.
			const group: GroupData = {
				...prevState.multiSelectGroup,
				id: newId(),
				type: "Group",
				isSelected: true,
				showOutline: true,
				items: selectedItems.map((item) => ({
					...item,
					isSelected: false,
					showOutline: false,
				})),
			};
			// Remove grouped shapes from the shape array
			let items = removeGroupedRecursive(prevState.items);
			// Add new group
			items = [...items, group];

			// Generate event ID and create new state
			const eventId = newEventId();
			const newState = {
				...prevState,
				items,
				multiSelectGroup: undefined,
			} as SvgCanvasState;

			// Notify the data change.
			onDataChange(eventId, newState);

			return newState;
		});
	}, []);
};
