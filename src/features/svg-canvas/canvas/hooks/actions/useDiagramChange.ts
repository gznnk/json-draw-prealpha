// Import React.
import { useCallback, useRef } from "react";

// Import types.
import type { DiagramChangeEvent } from "../../../types/events/DiagramChangeEvent";
import type { Diagram } from "../../../types/state/catalog/Diagram";
import type { GroupState } from "../../../types/state/shapes/GroupState";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";

// Import constants.
import { MULTI_SELECT_GROUP } from "../../SvgCanvasConstants";

// Import utils.
import { isItemableState } from "../../../utils/validation/isItemableState";
import { isSelectableState } from "../../../utils/validation/isSelectableState";
import { applyFunctionRecursively } from "../../utils/applyFunctionRecursively";
import { isHistoryEvent } from "../../utils/isHistoryEvent";
import { updateOutlineOfAllGroups } from "../../utils/updateOutlineOfAllGroups";

// Import hooks.
import { useAddHistory } from "../history/useAddHistory";

/**
 * Custom hook to handle diagram change events on the canvas.
 */
export const useDiagramChange = (props: SvgCanvasSubHooksProps) => {
	// Get the data change handler.
	const onDataChange = useAddHistory(props);

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
			let multiSelectGroup: GroupState | undefined = prevState.multiSelectGroup;

			if (e.id === MULTI_SELECT_GROUP) {
				// The case of multi-select group change.

				// Update the multi-select group with the new properties.
				multiSelectGroup = {
					...multiSelectGroup,
					...e.endDiagram,
				} as GroupState;

				// Propagate the multi-select group changes to the original diagrams.
				items = applyFunctionRecursively(prevState.items, (item) => {
					if (!isItemableState<Diagram>(e.endDiagram)) return item; // Type guard with Diagram type

					// Find the corresponding change data in the multi-select group.
					const changedItem = (e.endDiagram.items ?? []).find(
						(i) => i.id === item.id,
					);

					// If there is no corresponding change data, return the original item.
					if (!changedItem) return item;

					// Prepare the new item with the original properties.
					let newItem = { ...item };

					if (isSelectableState(changedItem)) {
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
			const newState = {
				...prevState,
				items,
				multiSelectGroup,
			};

			if (isHistoryEvent(e.eventPhase)) {
				// Set the history event ID and notify the data change.
				onDataChange(e.eventId, newState);
			}

			return newState;
		});
	}, []);
};
