// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { GroupData } from "../../../types/data/shapes/GroupData";
import type { DiagramSelectEvent } from "../../../types/events/DiagramSelectEvent";

// Import components related to SvgCanvas.
import { createMultiSelectGroup } from "../../utils/createMultiSelectGroup";

// Import functions related to SvgCanvas.
import { applyFunctionRecursively } from "../../utils/applyFunctionRecursively";
import { getSelectedItems } from "../../../utils/common/getSelectedItems";
import type { CanvasHooksProps } from "../../SvgCanvasTypes";

// Imports related to this component.
import { MULTI_SELECT_GROUP } from "../../SvgCanvasConstants";

// Import utility functions.
import { isSelectableData } from "../../../utils/validation/isSelectableData";
import { getAncestorItemsById } from "../../utils/getAncestorItemsById";

/**
 * Custom hook to handle select events on the canvas.
 */
export const useSelect = (props: CanvasHooksProps, isCtrlPressed?: boolean) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
		isCtrlPressed,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: DiagramSelectEvent) => {
		// Ignore the selection event of the multi-select group itself.
		if (e.id === MULTI_SELECT_GROUP) return;

		// Bypass references to avoid function creation in every render.
		const {
			props: { setCanvasState },
			isCtrlPressed,
		} = refBus.current;

		setCanvasState((prevState) => {
			// If the item is already selected, do nothing.
			const selectedItem = getSelectedItems(prevState.items).find(
				(item) => item.id === e.id,
			);
			if (selectedItem) {
				return prevState; // If the item is already selected, do nothing.
			}

			let targetId = e.id;
			// Check if the selected item is in a group.
			const ancestorsOfSelected = getAncestorItemsById(e.id, prevState);
			if (ancestorsOfSelected.length > 0) {
				const selectedAncestorIdx = ancestorsOfSelected.findIndex(
					(ancestor) => isSelectableData(ancestor) && ancestor.isSelected,
				);
				if (selectedAncestorIdx >= 0) {
					if (e.allowDescendantSelection) {
						if (selectedAncestorIdx < ancestorsOfSelected.length - 1) {
							// Select the next unselected ancestor.
							targetId = ancestorsOfSelected[selectedAncestorIdx + 1].id;
						} else {
							// If the last ancestor is selected, select the item triggering the event.
						}
					} else {
						return prevState; // If the selected ancestor is already selected, do nothing.
					}
				} else {
					// If the selected item is not found in the ancestors, use the first ancestor's ID.
					targetId = ancestorsOfSelected[0].id;
				}
			}

			// Update the selected state of the items.
			const items = applyFunctionRecursively(
				prevState.items,
				(item, ancestors) => {
					if (!isSelectableData(item)) {
						// Skip if the item is not selectable.
						return item;
					}

					const isAncestorSelected = ancestors.some(
						(ancestor) => isSelectableData(ancestor) && ancestor.isSelected,
					);

					if (item.id === targetId) {
						if (isCtrlPressed) {
							// When multiple selection, toggle the selection state of the selected diagram.
							return {
								...item,
								isSelected: !item.isSelected,
								showTransformControls: !item.isSelected, // Toggle transform controls visibility.
							};
						}

						// Apply the selected state to the diagram.
						return {
							...item,
							isSelected: true,
							showTransformControls: true, // Show transform controls when selected.
						};
					}

					if (isCtrlPressed) {
						// When multiple selection, do not change the selection state of the selected diagram.
						return {
							...item,
							isAncestorSelected,
						};
					}

					return {
						...item,
						// When single selection, clear the selection state of all diagrams except the selected one.
						isSelected: false,
						showTransformControls: false, // Hide transform controls when not selected.
						isAncestorSelected,
					};
				},
			);

			// The following code handles multiple selection.

			// Get the selected diagrams from the updated state.
			const selectedItems = getSelectedItems(items);

			// When multiple items are selected, create a dummy group to manage the selected items.
			let multiSelectGroup: GroupData | undefined = undefined;
			if (1 < selectedItems.length) {
				if (selectedItems.some((item) => item.type === "ConnectLine")) {
					// If the selected items include a connection line, keep their selection state unchanged to prevent grouping.
					return prevState;
				}
				// Create initial values for the multi-select group
				multiSelectGroup = createMultiSelectGroup(
					selectedItems,
					prevState.multiSelectGroup?.keepProportion,
				);
			}

			return {
				...prevState,
				items,
				multiSelectGroup,
			};
		});
	}, []);
};
