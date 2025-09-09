// Import React.
import { useCallback, useRef } from "react";

// Import types.
import type { GroupState } from "../../../types/state/shapes/GroupState";
import type { SvgCanvasState } from "../../types/SvgCanvasState";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";

import { getSelectedDiagrams } from "../../../utils/core/getSelectedDiagrams";
// Import utils.
import { newEventId } from "../../../utils/core/newEventId";
import { newId } from "../../../utils/shapes/common/newId";
import { removeGroupedRecursive } from "../../utils/removeGroupedRecursive";

import { isSelectableState } from "../../../utils/validation/isSelectableState";
import { applyFunctionRecursively } from "../../utils/applyFunctionRecursively";
// Import hooks.
import { useAddHistory } from "../history/useAddHistory";

/**
 * Custom hook to handle group events on the canvas.
 */
export const useGroup = (props: SvgCanvasSubHooksProps) => {
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
			const group: GroupState = {
				...prevState.multiSelectGroup,
				id: newId(),
				type: "Group",
				isSelected: true,
				showOutline: true,
				items: applyFunctionRecursively(selectedItems, (childItem) => {
					if (!isSelectableState(childItem)) {
						// Ignore non-selectable child items.
						return childItem;
					}
					return {
						...childItem,
						isSelected: false,
						isAncestorSelected: true,
						showOutline: true,
					};
				}),
			};
			// Remove grouped shapes from the shape array
			let items = removeGroupedRecursive(prevState.items);
			// Add new group
			items = [...items, group];

			// Generate event ID and create new state
			const eventId = newEventId();
			let newState = {
				...prevState,
				items,
				multiSelectGroup: undefined,
			} as SvgCanvasState;

			// Add history
			newState = addHistory(eventId, newState);

			return newState;
		});
	}, []);
};
