// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { ConnectLineData } from "../../../types/data/shapes/ConnectLineData";
import type { CanvasHooksProps, SvgCanvasState } from "../../SvgCanvasTypes";

// Import functions related to SvgCanvas.
import { newEventId } from "../../../utils/common/newEventId";
import { isItemableData } from "../../../utils/validation/isItemableData";
import { isSelectableData } from "../../../utils/validation/isSelectableData";
import { addHistory } from "../../utils/addHistory";
import { svgCanvasStateToData } from "../../utils/svgCanvasStateToData";
import { applyRecursive } from "../../utils/applyRecursive";
import { getDiagramById } from "../../../utils/common/getDiagramById";

/**
 * Custom hook to handle delete events on the canvas.
 */
export const useDelete = (props: CanvasHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;
	return useCallback(() => {
		// Bypass references to avoid function creation in every render.
		const { setCanvasState, onDataChange } = refBus.current.props;

		setCanvasState((prevState) => {
			// Remove selected items.
			let items = applyRecursive(prevState.items, (item) => {
				if (!isSelectableData(item)) {
					return item;
				}
				if (isItemableData(item)) {
					return {
						...item,
						items: item.items?.filter(
							(i) => !isSelectableData(i) || !i.isSelected,
						),
					};
				}
				return item;
			}).filter((item) => !isSelectableData(item) || !item.isSelected);

			// Find all ConnectLine components.
			const connectLines = items.filter(
				(item) => item.type === "ConnectLine",
			) as ConnectLineData[];

			// Remove ConnectLine components whose owner was deleted."
			for (const connectLine of connectLines) {
				if (
					!getDiagramById(items, connectLine.startOwnerId) ||
					!getDiagramById(items, connectLine.endOwnerId)
				) {
					items = items.filter((item) => item.id !== connectLine.id);
				}
			}

			// Create new state.
			let newState = {
				...prevState,
				items, // Apply new items after removing the selected items.
				multiSelectGroup: undefined, // Hide the multi-select group because the selected items were deleted.
			} as SvgCanvasState;

			// Add a new history entry.
			newState.lastHistoryEventId = newEventId();
			newState = addHistory(prevState, newState);

			// Notify the data change.
			onDataChange?.(svgCanvasStateToData(newState));

			return newState;
		});
	}, []);
};
