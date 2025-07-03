// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { GroupData } from "../../../types/data/shapes/GroupData";
import type { CanvasHooksProps, SvgCanvasState } from "../../SvgCanvasTypes";

// Import functions related to SvgCanvas.
import { newId } from "../../../utils/shapes/common/newId";
import { newEventId } from "../../../utils/common/newEventId";
import { addHistory } from "../../utils/addHistory";
import { svgCanvasStateToData } from "../../utils/svgCanvasStateToData";
import { getSelectedItems } from "../../../utils/common/getSelectedItems";
import { removeGroupedRecursive } from "../../utils/removeGroupedRecursive";

/**
 * Custom hook to handle group events on the canvas.
 */
export const useGroup = (props: CanvasHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback(() => {
		// Bypass references to avoid function creation in every render.
		const { setCanvasState, onDataChange } = refBus.current.props;

		setCanvasState((prevState) => {
			const selectedItems = getSelectedItems(prevState.items);
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

			// Create new state
			let newState = {
				...prevState,
				items,
				multiSelectGroup: undefined,
			} as SvgCanvasState;

			// Add a new history entry.
			newState.lastHistoryEventId = newEventId();
			newState = addHistory(prevState, newState);

			// Notify the data change.
			onDataChange?.(svgCanvasStateToData(newState));

			return newState;
		});
	}, []);
};
