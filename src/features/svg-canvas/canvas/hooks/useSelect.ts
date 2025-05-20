// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { GroupData } from "../../types/data/shapes/GroupData";
import type { DiagramSelectEvent } from "../../types/events/DiagramSelectEvent";

// Import components related to SvgCanvas.
import { calcGroupBoxOfNoRotation } from "../../components/shapes/Group/GroupFunctions";

// Import functions related to SvgCanvas.
import { applyMultiSelectSourceRecursive } from "../utils/applyMultiSelectSourceRecursive";
import { applyRecursive } from "../utils/applyRecursive";
import { getSelectedItems } from "../../utils/common/getSelectedItems";
import type { CanvasHooksProps } from "../SvgCanvasTypes";

// Imports related to this component.
import { MULTI_SELECT_GROUP } from "../SvgCanvasConstants";

// Import utility functions.
import { isSelectableData } from "../../utils/validation/isSelectableData";

/**
 * Custom hook to handle select events on the canvas.
 */
export const useSelect = (props: CanvasHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: DiagramSelectEvent) => {
		// Ignore the selection event of the multi-select group itself.
		if (e.id === MULTI_SELECT_GROUP) return;

		// Bypass references to avoid function creation in every render.
		const { setCanvasState } = refBus.current.props;

		setCanvasState((prevState) => {
			// Update the selected state of the items.
			let items = applyRecursive(prevState.items, (item) => {
				if (!isSelectableData(item)) {
					// Skip if the item is not selectable.
					return item;
				}

				if (item.id === e.id) {
					if (e.isMultiSelect) {
						// When multiple selection, toggle the selection state of the selected diagram.
						return {
							...item,
							isSelected: !item.isSelected,
						};
					}

					// Apply the selected state to the diagram.
					return { ...item, isSelected: true };
				}

				if (e.isMultiSelect && item.isSelected) {
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

				// 褁E��選択グループ�E初期値を作�E
				const box = calcGroupBoxOfNoRotation(selectedItems);
				multiSelectGroup = {
					id: MULTI_SELECT_GROUP,
					x: box.left + (box.right - box.left) / 2,
					y: box.top + (box.bottom - box.top) / 2,
					width: box.right - box.left,
					height: box.bottom - box.top,
					rotation: 0,
					scaleX: 1,
					scaleY: 1,
					keepProportion: prevState.multiSelectGroup?.keepProportion ?? true,
					isSelected: true, // 褁E��選択用のグループ�E常に選択状態にする
					isMultiSelectSource: false, // 褁E��選択�E選択�EではなぁE��設宁E
					items: applyRecursive(selectedItems, (item) => {
						if (!isSelectableData(item)) {
							return item;
						}
						return {
							...item,
							isSelected: false, // 褁E��選択用のグループ�Eの図形は選択状態を解除
							isMultiSelectSource: false, // 褁E��選択�E選択�EではなぁE��設宁E
						};
					}),
				} as GroupData;

				// Set `isMultiSelectSource` to true to hide the transform outline of the original diagrams during multi-selection.
				items = applyMultiSelectSourceRecursive(items);
			} else {
				// 褁E��選択でなぁE��合�E、�E図形に対して褁E��選択�E選択�EではなぁE��設宁E
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
