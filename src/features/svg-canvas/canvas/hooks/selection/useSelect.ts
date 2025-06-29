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

// Import utility functions.
import { isSelectableData } from "../../../utils/validation/isSelectableData";
import { getAncestorItemsById } from "../../utils/getAncestorItemsById";
import { isItemableData } from "../../../utils/validation/isItemableData";

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
		// Bypass references to avoid function creation in every render.
		const {
			props: { setCanvasState },
			isCtrlPressed,
		} = refBus.current;

		setCanvasState((prevState) => {
			// Get the ancestors of the selected item.
			const ancestorsOfSelectingItem = getAncestorItemsById(e.id, prevState);
			// If the ancestors of the selected item are empty, it means the item is not part of a group.
			const isGroupedItemSelection = ancestorsOfSelectingItem.length > 0;
			// Find the index of the first ancestor that is selected.
			const selectedAncestorIdx = ancestorsOfSelectingItem.findIndex(
				(ancestor) => isSelectableData(ancestor) && ancestor.isSelected,
			);
			// Check if the selected ancestor is selected.
			const isAncestorSelected = selectedAncestorIdx >= 0;

			if (!isCtrlPressed) {
				// Single selection logic.
				// Calculate the new selection target ID based on the selection mode.
				// In single selection mode, clear the selection state of all items except the target item.
				let newSelectionTargetId: string;

				if (!isGroupedItemSelection) {
					// If the item is not part of a group, use the item's ID.
					newSelectionTargetId = e.id;
				} else {
					// Grouped item selection logic.
					if (isAncestorSelected) {
						if (!e.allowDescendantSelection) {
							// If the selected ancestor is selected and does not allow descendant selection, do nothing.
							return prevState;
						}
						// Check if the selected ancestor is the parent of the selected item.
						const isSelectedAncestorIsParent =
							selectedAncestorIdx === ancestorsOfSelectingItem.length - 1;
						if (isSelectedAncestorIsParent) {
							// If the selected ancestor is the parent of the selected item,
							// select the item triggering the event.
							newSelectionTargetId = e.id;
						} else {
							// If the selected ancestor is not the parent of the selected item,
							// select the next unselected ancestor.
							newSelectionTargetId =
								ancestorsOfSelectingItem[selectedAncestorIdx + 1].id;
						}
					} else {
						// Check if any of the already selected items belong to the same group as the currently selected item.
						const isSelectedItemExistsInSameGroup =
							ancestorsOfSelectingItem.some(
								(ancestor) =>
									isItemableData(ancestor) &&
									ancestor.items.some((item) => item.id === e.id) &&
									ancestor.items.some(
										(item) => isSelectableData(item) && item.isSelected,
									),
							);
						if (isSelectedItemExistsInSameGroup) {
							// If any selected item belongs to the same group, select the item triggering the event.
							newSelectionTargetId = e.id;
						} else {
							// Check if there is a common ancestor with selected items.
							const reversedAncestorsOfSelectingItem = ancestorsOfSelectingItem
								.slice()
								.reverse();
							const commonAncestorOfSelectedItemIdx =
								reversedAncestorsOfSelectingItem.findIndex(
									(ancestor) =>
										isItemableData(ancestor) &&
										getSelectedItems(ancestor.items).length > 0,
								);
							if (0 <= commonAncestorOfSelectedItemIdx) {
								if (commonAncestorOfSelectedItemIdx === 0) {
									// If the common ancestor is the last ancestor,
									// select the item triggering the event.
									newSelectionTargetId = e.id;
								} else {
									// If there is a common ancestor with selected items, select the next unselected ancestor.
									newSelectionTargetId =
										reversedAncestorsOfSelectingItem[
											commonAncestorOfSelectedItemIdx - 1
										].id;
								}
							} else {
								// If there is no common ancestor with selected items, select the first ancestor.
								newSelectionTargetId = ancestorsOfSelectingItem[0].id;
							}
						}
					}
				}

				// Update the selected state of the items.
				return {
					...prevState,
					items: applyFunctionRecursively(
						prevState.items,
						(item, ancestors) => {
							if (!isSelectableData(item)) {
								// Skip if the item is not selectable.
								return item;
							}

							const isAncestorSelected = ancestors.some(
								(ancestor) => isSelectableData(ancestor) && ancestor.isSelected,
							);

							if (item.id === newSelectionTargetId) {
								// Apply the selected state to the diagram.
								return {
									...item,
									isSelected: true,
									showTransformControls: true, // Show transform controls when selected.
									isAncestorSelected: false, // Clear ancestor selection state.
								};
							}

							// Clear the selection state of all diagrams except the selected one.
							return {
								...item,
								isSelected: false,
								showTransformControls: false, // Hide transform controls when not selected.
								isAncestorSelected,
							};
						},
					),
				};
			}

			// Multi-selection logic.
			// TODO: implement multi-select logic.

			// If the item is already selected, do nothing.
			const selectedItem = getSelectedItems(prevState.items).find(
				(item) => item.id === e.id,
			);
			if (selectedItem) {
				return prevState; // If the item is already selected, do nothing.
			}

			let targetId = e.id;

			if (ancestorsOfSelectingItem.length > 0) {
				if (selectedAncestorIdx >= 0) {
					if (e.allowDescendantSelection) {
						if (selectedAncestorIdx < ancestorsOfSelectingItem.length - 1) {
							// Select the next unselected ancestor.
							targetId = ancestorsOfSelectingItem[selectedAncestorIdx + 1].id;
						} else {
							// If the last ancestor is selected, select the item triggering the event.
						}
					} else {
						return prevState; // If the selected ancestor is already selected, do nothing.
					}
				} else {
					// If the selected item is not found in the ancestors, use the first ancestor's ID.
					targetId = ancestorsOfSelectingItem[0].id;
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
