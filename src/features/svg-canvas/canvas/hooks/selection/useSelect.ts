// Import React.
import { useCallback, useRef } from "react";

// Import types.
import type { Diagram } from "../../../types/data/catalog/Diagram";
import type { GroupData } from "../../../types/data/shapes/GroupData";
import type { DiagramSelectEvent } from "../../../types/events/DiagramSelectEvent";
import type { CanvasHooksProps } from "../../SvgCanvasTypes";

// Import utils.
import { getDiagramById } from "../../../utils/common/getDiagramById";
import { getSelectedItems } from "../../../utils/common/getSelectedItems";
import { isItemableData } from "../../../utils/validation/isItemableData";
import { isSelectableData } from "../../../utils/validation/isSelectableData";
import { applyFunctionRecursively } from "../../utils/applyFunctionRecursively";
import { createMultiSelectGroup } from "../../utils/createMultiSelectGroup";
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
		// Bypass references to avoid function creation in every render.
		const {
			props: { setCanvasState },
			isCtrlPressed,
		} = refBus.current;

		setCanvasState((prevState) => {
			// Check the selection state of the item triggering the event.
			const eventTriggeredItem = getDiagramById(prevState.items, e.id);
			const isEventTriggeredItemSelected =
				isSelectableData(eventTriggeredItem) && eventTriggeredItem.isSelected;
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

			// Calculate the new selection target ID based on the selection mode.
			let newSelectionTargetId: string;
			let newSelectionState = true;

			if (!isGroupedItemSelection) {
				// Non-grouped item selection logic.
				if (!isEventTriggeredItemSelected) {
					// If the item is not selected and not part of a group, select the item.
					newSelectionTargetId = e.id;
				} else if (
					isCtrlPressed &&
					e.isTriggeredByClick &&
					e.isSelectedOnPointerDown
				) {
					// If the item is already selected, deselect it.
					newSelectionTargetId = e.id;
					newSelectionState = false;
				} else {
					// If the item is already selected and Ctrl is not pressed, do nothing.
					return prevState;
				}
			} else {
				// Grouped item selection logic.
				if (isAncestorSelected) {
					if (!e.isTriggeredByClick) {
						// If the selection is not triggered by a click, do not change the selection state.
						return prevState;
					}
					if (!e.isAncestorSelectedOnPointerDown) {
						// If the ancestor is not selected on pointer down,
						// do not change the selection state.
						return prevState;
					}
					// Check if the selected ancestor is the parent of the selected item.
					const isSelectedAncestorIsParent =
						selectedAncestorIdx === ancestorsOfSelectingItem.length - 1;
					if (isSelectedAncestorIsParent) {
						if (!isEventTriggeredItemSelected) {
							if (!isCtrlPressed) {
								// If the selected ancestor is the parent of the selected item and Ctrl is not pressed,
								// select the item triggering the event.
								newSelectionTargetId = e.id;
							} else {
								// If the selected ancestor is the parent of the selected item and Ctrl is pressed,
								// deselect the parent item.
								newSelectionTargetId =
									ancestorsOfSelectingItem[selectedAncestorIdx].id;
								newSelectionState = false;
							}
						} else {
							// If the selected ancestor is the parent of the selected item and the item is already selected,
							// do not change the selection state.
							return prevState;
						}
					} else {
						if (!isEventTriggeredItemSelected) {
							if (!isCtrlPressed) {
								// If the selected ancestor is not the parent of the selected item and Ctrl is not pressed,
								// select the next unselected ancestor.
								newSelectionTargetId =
									ancestorsOfSelectingItem[selectedAncestorIdx + 1].id;
							} else {
								// If the selected ancestor is not the parent of the selected item and Ctrl is pressed,
								// deselect the ancestor item.
								newSelectionTargetId =
									ancestorsOfSelectingItem[selectedAncestorIdx].id;
								newSelectionState = false;
							}
						} else {
							// If the selected ancestor is not the parent of the selected item and the item is already selected,
							// do not change the selection state.
							return prevState;
						}
					}
				} else {
					// Check if any of the already selected items belong to the same group as the currently selected item.
					const isSelectedItemExistsInSameGroup = ancestorsOfSelectingItem.some(
						(ancestor) =>
							isItemableData(ancestor) &&
							ancestor.items.some((item) => item.id === e.id) &&
							ancestor.items.some(
								(item) => isSelectableData(item) && item.isSelected,
							),
					);
					if (isSelectedItemExistsInSameGroup) {
						if (!isEventTriggeredItemSelected) {
							// If the item is not selected and belongs to a group with selected items, select the item.
							newSelectionTargetId = e.id;
						} else if (
							isCtrlPressed &&
							e.isTriggeredByClick &&
							e.isSelectedOnPointerDown
						) {
							// If the item is already selected and Ctrl is pressed, deselect the item.
							newSelectionTargetId = e.id;
							newSelectionState = false;
						} else {
							// If the item is already selected and Ctrl is not pressed, do nothing.
							return prevState;
						}
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
							if (!isEventTriggeredItemSelected) {
								if (commonAncestorOfSelectedItemIdx === 0) {
									// If there is a common ancestor with selected items and the item is not selected,
									// select the item triggering the event.
									newSelectionTargetId = e.id;
								} else {
									// If there is a common ancestor with selected items, select the next unselected ancestor.
									newSelectionTargetId =
										reversedAncestorsOfSelectingItem[
											commonAncestorOfSelectedItemIdx - 1
										].id;
								}
							} else if (
								isCtrlPressed &&
								e.isTriggeredByClick &&
								e.isSelectedOnPointerDown
							) {
								// If the item is already selected and Ctrl is pressed, deselect the item.
								newSelectionTargetId = e.id;
								newSelectionState = false;
							} else {
								// If the item is already selected and Ctrl is not pressed, do nothing.
								return prevState;
							}
						} else {
							if (!isEventTriggeredItemSelected) {
								// If there is no common ancestor with selected items, select the first ancestor.
								newSelectionTargetId = ancestorsOfSelectingItem[0].id;
							} else if (
								isCtrlPressed &&
								e.isTriggeredByClick &&
								e.isSelectedOnPointerDown
							) {
								// If the item is already selected and Ctrl is pressed, deselect the item.
								newSelectionTargetId = e.id;
								newSelectionState = false;
							} else {
								// If the item is already selected and Ctrl is not pressed, do nothing.
								return prevState;
							}
						}
					}
				}
			}

			// Update the selected state of the items.
			let items = applyFunctionRecursively(prevState.items, (item) => {
				if (!isSelectableData(item)) {
					// Skip if the item is not selectable.
					return item;
				}

				if (item.id === newSelectionTargetId) {
					if (isCtrlPressed) {
						// If Ctrl is pressed, toggle the selection state of the item.
						return {
							...item,
							isSelected: newSelectionState,
							showTransformControls: newSelectionState,
							showOutline: newSelectionState,
						};
					}
					// Apply the selected state to the diagram.
					return {
						...item,
						isSelected: true,
						showTransformControls: true, // Show transform controls when selected.
						showOutline: true, // Show outline when selected.
					};
				}

				if (isCtrlPressed) {
					// If Ctrl is pressed, keep the current selection state.
					return {
						...item,
						showTransformControls: item.isSelected, // Keep transform controls visibility based on current selection state.
						showOutline: item.isSelected, // Keep outline visibility based on current selection state.
					};
				}

				// In single selection mode, clear the selection state of all items except the target item.
				return {
					...item,
					isSelected: false,
					showTransformControls: false, // Hide transform controls when not selected.
					showOutline: false, // Hide outline when not selected.
				};
			});

			// Multi-selection logic.

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

				// Process group selection and handle transform controls in one pass
				const processMultiSelectionLogic = (items: Diagram[]): Diagram[] => {
					const processItem = (item: Diagram): Diagram => {
						// First, recursively process all nested items (bottom-up approach)
						if (isItemableData(item)) {
							const updatedItems = item.items.map(processItem);

							// After processing children, check if this group should be selected
							if (
								!item.isSelected && // Only process groups that are not already selected
								updatedItems.length > 0 && // Ensure the group has children
								updatedItems.every(
									(child) => isSelectableData(child) && child.isSelected,
								)
							) {
								// Deselect all children when the group is selected
								const deselectedItems = updatedItems.map((child) => {
									if (isSelectableData(child)) {
										return {
											...child,
											isSelected: false,
											showTransformControls: false,
											showOutline: true, // Keep outline visible for children of selected groups
										};
									}
									return child;
								});
								return {
									...item,
									items: deselectedItems,
									isSelected: true,
									showTransformControls: false,
									showOutline: true, // Show outline for the group.
								};
							}

							// If no selection change, return with updated items
							return {
								...item,
								showTransformControls: false,
								items: updatedItems,
							};
						}

						return {
							...item,
							showTransformControls: false,
						};
					};

					return items.map(processItem);
				};

				items = processMultiSelectionLogic(items);
			}

			// Update isAncestorSelected and showOutline state for all items.
			items = applyFunctionRecursively(items, (item, ancestors) => {
				if (!isSelectableData(item)) {
					// Skip if the item is not selectable.
					return item;
				}

				const isAncestorSelected = ancestors.some(
					(ancestor) => isSelectableData(ancestor) && ancestor.isSelected,
				);

				// Show outline when the item is selected or when any ancestor is selected
				const shouldShowOutline = item.isSelected || isAncestorSelected;

				return {
					...item,
					isAncestorSelected,
					showOutline: shouldShowOutline,
				};
			});

			return {
				...prevState,
				items,
				multiSelectGroup,
			};
		});
	}, []);
};
