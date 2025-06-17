// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { GroupData } from "../../../types/data/shapes/GroupData";
import type { Diagram } from "../../../types/data/catalog/Diagram";
import type { CanvasHooksProps } from "../../SvgCanvasTypes";

// Import components related to SvgCanvas.
import { calcUnrotatedGroupBoundingBox } from "../../../utils/shapes/group/calcUnrotatedGroupBoundingBox";

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

			const boundingBox = calcUnrotatedGroupBoundingBox(multiSelectGroupItems);

			const multiSelectGroup = {
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
				isMultiSelectSource: false, // Set as not being a multi-select source
				items: applyRecursive(multiSelectGroupItems, (item) => {
					if (!isSelectableData(item)) {
						return item;
					}
					return {
						...item,
						isSelected: false, // Shapes in the multi-select group have their selection state cleared
						isMultiSelectSource: false, // Set as not being a multi-select source
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
