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
import { getSelectedItems } from "../utils/getSelectedItems";
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

				// 隍・焚驕ｸ謚槭げ繝ｫ繝ｼ繝励・蛻晄悄蛟､繧剃ｽ懈・
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
					isSelected: true, // 隍・焚驕ｸ謚樒畑縺ｮ繧ｰ繝ｫ繝ｼ繝励・蟶ｸ縺ｫ驕ｸ謚樒憾諷九↓縺吶ｋ
					isMultiSelectSource: false, // 隍・焚驕ｸ謚槭・驕ｸ謚槫・縺ｧ縺ｯ縺ｪ縺・→險ｭ螳・
					items: applyRecursive(selectedItems, (item) => {
						if (!isSelectableData(item)) {
							return item;
						}
						return {
							...item,
							isSelected: false, // 隍・焚驕ｸ謚樒畑縺ｮ繧ｰ繝ｫ繝ｼ繝怜・縺ｮ蝗ｳ蠖｢縺ｯ驕ｸ謚樒憾諷九ｒ隗｣髯､
							isMultiSelectSource: false, // 隍・焚驕ｸ謚槭・驕ｸ謚槫・縺ｧ縺ｯ縺ｪ縺・→險ｭ螳・
						};
					}),
				} as GroupData;

				// Set `isMultiSelectSource` to true to hide the transform outline of the original diagrams during multi-selection.
				items = applyMultiSelectSourceRecursive(items);
			} else {
				// 隍・焚驕ｸ謚槭〒縺ｪ縺・ｴ蜷医・縲∝・蝗ｳ蠖｢縺ｫ蟇ｾ縺励※隍・焚驕ｸ謚槭・驕ｸ謚槫・縺ｧ縺ｯ縺ｪ縺・→險ｭ螳・
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
