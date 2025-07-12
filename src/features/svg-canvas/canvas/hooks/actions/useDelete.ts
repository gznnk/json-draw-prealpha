// Import React.
import { useCallback, useRef } from "react";

// Import types.
import type { ConnectLineData } from "../../../types/data/shapes/ConnectLineData";
import type { CanvasHooksProps, SvgCanvasState } from "../../SvgCanvasTypes";

// Import utils.
import { newEventId } from "../../../utils/common/newEventId";
import { isItemableData } from "../../../utils/validation/isItemableData";
import { isSelectableData } from "../../../utils/validation/isSelectableData";
import { addHistory } from "../../utils/addHistory";
import { applyFunctionRecursively } from "../../utils/applyFunctionRecursively";
import { svgCanvasStateToData } from "../../utils/svgCanvasStateToData";

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

	// Return a callback function to handle the delete action.
	return useCallback(() => {
		// Bypass references to avoid function creation in every render.
		const { setCanvasState, onDataChange } = refBus.current.props;

		setCanvasState((prevState) => {
			// Collect IDs of items that will be deleted and remove selected items.
			const deletedItemIds = new Set<string>();

			let items = applyFunctionRecursively(prevState.items, (item) => {
				if (!isSelectableData(item)) {
					return item;
				}

				// Collect deleted item ID if selected
				if (item.isSelected) {
					deletedItemIds.add(item.id);
				}

				if (isItemableData(item)) {
					// Collect deleted child item IDs and filter them
					const filteredItems = item.items?.filter((childItem) => {
						if (isSelectableData(childItem) && childItem.isSelected) {
							deletedItemIds.add(childItem.id);
							return false;
						}
						return true;
					});

					return {
						...item,
						items: filteredItems,
					};
				}
				return item;
			}).filter((item) => {
				if (isSelectableData(item) && item.isSelected) {
					deletedItemIds.add(item.id);
					return false;
				}
				return true;
			});

			// Remove ConnectLine components whose owner was deleted.
			items = items.filter((item) => {
				if (item.type === "ConnectLine") {
					const connectLine = item as ConnectLineData;
					return (
						!deletedItemIds.has(connectLine.startOwnerId) &&
						!deletedItemIds.has(connectLine.endOwnerId)
					);
				}
				return true;
			});

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
