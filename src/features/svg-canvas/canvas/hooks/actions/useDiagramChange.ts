// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { Diagram } from "../../../types/data/catalog/Diagram";
import type { GroupData } from "../../../types/data/shapes/GroupData";
import type { DiagramChangeEvent } from "../../../types/events/DiagramChangeEvent";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";

// Import functions related to SvgCanvas.
import { isItemableData } from "../../../utils/validation/isItemableData";
import { isSelectableData } from "../../../utils/validation/isSelectableData";
import { addHistory } from "../../utils/addHistory";
import { applyFunctionRecursively } from "../../utils/applyFunctionRecursively";
import { isHistoryEvent } from "../../utils/isHistoryEvent";
import { updateOutlineOfAllGroups } from "../../utils/updateOutlineOfAllGroups";

// Import hooks.
import { useDataChange } from "../history/useDataChange";

// Imports related to this component.
import { MULTI_SELECT_GROUP } from "../../SvgCanvasConstants";
import type { SvgCanvasState } from "../../types/SvgCanvasState";

/**
 * Custom hook to handle diagram change events on the canvas.
 */
export const useDiagramChange = (props: SvgCanvasSubHooksProps) => {
	// Get the data change handler.
	const onDataChange = useDataChange(props);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
		onDataChange,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: DiagramChangeEvent) => {
		// Bypass references to avoid function creation in every render.
		const {
			props: { setCanvasState },
		} = refBus.current;
		const { onDataChange } = refBus.current;

		setCanvasState((prevState) => {
			let items = prevState.items;
			let multiSelectGroup: GroupData | undefined = prevState.multiSelectGroup;

			if (e.id === MULTI_SELECT_GROUP) {
				// The case of multi-select group change.

				// Update the multi-select group with the new properties.
				multiSelectGroup = {
					...multiSelectGroup,
					...e.endDiagram,
				} as GroupData;

				// Propagate the multi-select group changes to the original diagrams.
				items = applyFunctionRecursively(prevState.items, (item) => {
					if (!isItemableData<Diagram>(e.endDiagram)) return item; // Type guard with Diagram type

					// Find the corresponding change data in the multi-select group.
					const changedItem = (e.endDiagram.items ?? []).find(
						(i) => i.id === item.id,
					);

					// If there is no corresponding change data, return the original item.
					if (!changedItem) return item;

					// Prepare the new item with the original properties.
					let newItem = { ...item };

					if (isSelectableData(changedItem)) {
						// Remove the isSelected property that is not needed for the update.
						const { isSelected: _isSelected, ...updateItem } = changedItem;

						// Apply the updated properties to the original item.
						newItem = {
							...newItem,
							...updateItem,
						};
					}

					return newItem;
				});
			} else {
				// The case of single diagram change.
				items = applyFunctionRecursively(prevState.items, (item) => {
					// If the id does not match, return the original item.
					if (item.id !== e.id) return item;

					// If the id matches, update the item with the new properties.
					const newItem = { ...item, ...e.endDiagram };

					// Return the updated item.
					return newItem;
				});

				if (multiSelectGroup) {
					// When a multi-select group is present, propagate the original diagram changes to its items.
					// In this case, the changes are appearance only, so we don't need to update the connect points.
					multiSelectGroup.items = applyFunctionRecursively(
						multiSelectGroup.items,
						(item) =>
							item.id === e.id
								? { ...item, ...e.endDiagram, isSelected: false }
								: item,
					);
				}
			}

			// Update outline of all groups.
			items = updateOutlineOfAllGroups(items);

			// Create a new state with the updated items and multi-select group.
			let newState = {
				...prevState,
				items,
				multiSelectGroup,
			} as SvgCanvasState;

			if (isHistoryEvent(e.eventType)) {
				// Add a new history entry.
				newState.lastHistoryEventId = e.eventId;
				newState = addHistory(prevState, newState);

				// Notify the data change.
				onDataChange(newState);
			}

			return newState;
		});
	}, []);
};
