// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { GroupData } from "../../../types/data/shapes/GroupData";
import type { Diagram } from "../../../catalog/DiagramTypes";
import type { CanvasHooksProps } from "../../SvgCanvasTypes";

// Import components related to SvgCanvas.
import { calcGroupBoxOfNoRotation } from "../../../components/shapes/Group";

// Import functions related to SvgCanvas.
import { isSelectableData } from "../../../utils/validation/isSelectableData";
import { applyMultiSelectSourceRecursive } from "../../utils/applyMultiSelectSourceRecursive";
import { applyRecursive } from "../../utils/applyRecursive";

// Imports related to this component.
import { MULTI_SELECT_GROUP } from "../../SvgCanvasConstants";

/**
 * Custom hook to handle select all events on the canvas.
 */
export const useSelectAll = (props: CanvasHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback(() => {
		// Bypass references to avoid function creation in every render.
		const { setCanvasState } = refBus.current.props;

		setCanvasState((prevState) => {
			let items = prevState.items.map((item) => {
				if (!isSelectableData(item)) {
					// Ignore non-selectable items.
					return item;
				}
				if (item.type === "ConnectLine") {
					return {
						...item,
						isSelected: false, // Deselect ConnectLine items.
					};
				}
				return {
					...item,
					isSelected: true,
				};
			});

			// Set `isMultiSelectSource` to true to hide the transform outline of the original diagrams during multi-selection.
			items = applyMultiSelectSourceRecursive(items);

			// Create a multi-select group's items.
			const multiSelectGroupItems = items.filter(
				(item) => item.type !== "ConnectLine",
			) as Diagram[]; // Filter out ConnectLine items.
			if (multiSelectGroupItems.length < 2) {
				// If there are less than 2 items, do not create a multi-select group.
				return prevState;
			}

			const box = calcGroupBoxOfNoRotation(multiSelectGroupItems);

			const multiSelectGroup = {
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
				items: applyRecursive(multiSelectGroupItems, (item) => {
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

			return {
				...prevState,
				items,
				multiSelectGroup,
				selectedItemId: undefined,
			};
		});
	}, []);
};
