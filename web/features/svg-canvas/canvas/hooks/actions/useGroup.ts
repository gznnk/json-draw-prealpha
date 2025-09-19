import { useCallback, useRef } from "react";

import type { GroupState } from "../../../types/state/shapes/GroupState";
import { getSelectedDiagrams } from "../../../utils/core/getSelectedDiagrams";
import { newEventId } from "../../../utils/core/newEventId";
import { newId } from "../../../utils/shapes/common/newId";
import { isSelectableState } from "../../../utils/validation/isSelectableState";
import type { SvgCanvasState } from "../../types/SvgCanvasState";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";
import { applyFunctionRecursively } from "../../utils/applyFunctionRecursively";
import { bringConnectLinesForward } from "../../utils/bringConnectLinesForward";
import { cleanupGroups } from "../../utils/cleanupGroups";
import { removeSelectedDiagrams } from "../../utils/removeSelectedDiagrams";
import { updateOutlineOfAllItemables } from "../../utils/updateOutlineOfAllItemables";
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
			const selectedDiagrams = getSelectedDiagrams(prevState.items);
			if (selectedDiagrams.length < 2) {
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
				items: applyFunctionRecursively(selectedDiagrams, (childItem) => {
					if (!isSelectableState(childItem)) {
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
			// Create next state items.
			const selectedRemovedItems = removeSelectedDiagrams(prevState.items);
			const groupsCleanedUpItems = cleanupGroups(selectedRemovedItems);
			const mergedItems = [...groupsCleanedUpItems, group];

			// Bring connect lines forward that are connected to grouped components.
			const orderedItems = bringConnectLinesForward(
				mergedItems,
				selectedDiagrams,
			);

			const outlineUpdatedItems = updateOutlineOfAllItemables(orderedItems);

			// Create next state
			const eventId = newEventId();
			let nextState = {
				...prevState,
				items: outlineUpdatedItems,
				multiSelectGroup: undefined,
			} as SvgCanvasState;

			// Add history
			nextState = addHistory(eventId, nextState);

			return nextState;
		});
	}, []);
};
