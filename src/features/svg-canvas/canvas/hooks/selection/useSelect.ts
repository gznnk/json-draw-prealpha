// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { GroupData } from "../../../types/data/shapes/GroupData";
import type { DiagramSelectEvent } from "../../../types/events/DiagramSelectEvent";

// Import components related to SvgCanvas.
import { calcUnrotatedGroupBoundingBox } from "../../../utils/shapes/group/calcUnrotatedGroupBoundingBox";

// Import functions related to SvgCanvas.
import { applyMultiSelectSourceRecursive } from "../../utils/applyMultiSelectSourceRecursive";
import { applyRecursive } from "../../utils/applyRecursive";
import { getSelectedItems } from "../../../utils/common/getSelectedItems";
import type { CanvasHooksProps } from "../../SvgCanvasTypes";

// Imports related to this component.
import { MULTI_SELECT_GROUP } from "../../SvgCanvasConstants";

// Import utility functions.
import { isSelectableData } from "../../../utils/validation/isSelectableData";

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
			// Update the selected state of the items.
			let items = applyRecursive(prevState.items, (item) => {
				if (!isSelectableData(item)) {
					// Skip if the item is not selectable.
					return item;
				}

				if (item.id === e.id) {
					if (isCtrlPressed) {
						// When multiple selection, toggle the selection state of the selected diagram.
						return {
							...item,
							isSelected: !item.isSelected,
						};
					}

					// Apply the selected state to the diagram.
					return {
						...item,
						isSelected: true,
					};
				}

				if (isCtrlPressed && item.isSelected) {
					// When multiple selection, do not change the selection state of the selected diagram.
					return item;
				}

				return {
					...item,
					// When single selection, clear the selection state of all diagrams except the selected one.
					isSelected: false,
					isMultiSelectSource: false,
				};
			});

			// The following code handles multiple selection.
			// When multiple selection is active, use a dummy group to manage the selected diagrams.

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
				const boundingBox = calcUnrotatedGroupBoundingBox(selectedItems);
				multiSelectGroup = {
					id: MULTI_SELECT_GROUP,
					x: boundingBox.left + (boundingBox.right - boundingBox.left) / 2,
					y: boundingBox.top + (boundingBox.bottom - boundingBox.top) / 2,
					width: boundingBox.right - boundingBox.left,
					height: boundingBox.bottom - boundingBox.top,
					rotation: 0,
					scaleX: 1,
					scaleY: 1,
					keepProportion: prevState.multiSelectGroup?.keepProportion ?? true,
					isSelected: true, // Multi-select group is always in selected state
					isMultiSelectSource: false, // Multi-select group is not a multi-select source
					items: applyRecursive(selectedItems, (item) => {
						if (!isSelectableData(item)) {
							return item;
						}
						return {
							...item,
							isSelected: false, // Shapes in multi-select group have their selection state cleared
							isMultiSelectSource: false, // Multi-select source is not the selection source
						};
					}),
				} as GroupData;

				// Set `isMultiSelectSource` to true to hide the transform outline of the original diagrams during multi-selection.
				items = applyMultiSelectSourceRecursive(items);
			} else {
				// When not in multi-select mode, set all shapes to not be multi-select sources
				items = applyRecursive(items, (item) => {
					if (isSelectableData(item)) {
						return {
							...item,
							isMultiSelectSource: false,
						};
					}
					return item;
				});
			}

			return {
				...prevState,
				items,
				multiSelectGroup,
				selectedItemId: e.id,
			};
		});
	}, []);
};
