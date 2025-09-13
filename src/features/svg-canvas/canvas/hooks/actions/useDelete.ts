// Import React.
import { useCallback, useRef } from "react";

// Import types.
import type { Diagram } from "../../../types/state/core/Diagram";
import type { ConnectLineState } from "../../../types/state/shapes/ConnectLineState";
import type { SvgCanvasState } from "../../types/SvgCanvasState";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";

// Import utils.
import { newEventId } from "../../../utils/core/newEventId";
import { isItemableState } from "../../../utils/validation/isItemableState";
import { isSelectableState } from "../../../utils/validation/isSelectableState";
import { cleanupGroups } from "../../utils/cleanupGroups";
import { updateOutlineOfAllItemables } from "../../utils/updateOutlineOfAllItemables";
import { useAddHistory } from "../history/useAddHistory";

/**
 * Custom hook to handle delete events on the canvas.
 */
export const useDelete = (props: SvgCanvasSubHooksProps) => {
	// Get the data change handler.
	const addHistory = useAddHistory(props);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
		addHistory,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	// Return a callback function to handle the delete action.
	return useCallback(() => {
		// Bypass references to avoid function creation in every render.
		const {
			props: { setCanvasState },
			addHistory,
		} = refBus.current;

		setCanvasState((prevState) => {
			// Collect IDs of items that will be deleted and remove selected items.
			const deletedItemIds = new Set<string>();

			/**
			 * Recursively collect deleted item IDs from child items.
			 * @param items - Array of items to process
			 */
			const collectDeletedItemIds = (items: Diagram[]): void => {
				for (const item of items) {
					if (isSelectableState(item)) {
						deletedItemIds.add(item.id);
					}
					if (isItemableState(item) && item.items) {
						collectDeletedItemIds(item.items);
					}
				}
			};

			/**
			 * Recursively removes selected items and collects their IDs for deletion tracking.
			 * Also processes abstract itemable containers to remove selected children.
			 * @param items - Array of diagram items to process
			 * @returns Filtered array with selected items removed
			 */
			const removeSelectedItems = (items: Diagram[]): Diagram[] => {
				const result = [];

				for (const item of items) {
					if (isSelectableState(item) && item.isSelected) {
						// If item is selected, add it to deleted IDs
						deletedItemIds.add(item.id);
						// If it has child items, collect all child IDs as deleted
						if (isItemableState(item)) {
							collectDeletedItemIds(item.items);
						}
						// Don't include this item in the result (delete it)
						continue;
					}

					if (
						isItemableState(item) &&
						0 < item.items.length &&
						item.itemableType === "abstract"
					) {
						// If item is not selected but has children, process children recursively
						const processedChildItems = removeSelectedItems(item.items);
						result.push({
							...item,
							items: processedChildItems,
						});
					} else {
						// Item is not selected and has no children, keep it as is
						result.push(item);
					}
				}

				return result;
			};

			const selectedItemsRemovedItems = removeSelectedItems(prevState.items);

			// Remove ConnectLine components whose owner was deleted.
			const orphanedConnectionsRemovedItems = selectedItemsRemovedItems.filter(
				(item) => {
					if (item.type === "ConnectLine") {
						const connectLine = item as ConnectLineState;
						return (
							!deletedItemIds.has(connectLine.startOwnerId) &&
							!deletedItemIds.has(connectLine.endOwnerId)
						);
					}
					return true;
				},
			);

			const groupsCleanedUpItems = cleanupGroups(
				orphanedConnectionsRemovedItems,
			);

			const outlineUpdatedItems =
				updateOutlineOfAllItemables(groupsCleanedUpItems);

			let nextState = {
				...prevState,
				items: outlineUpdatedItems,
				multiSelectGroup: undefined, // Hide the multi-select group because the selected items were deleted.
			} as SvgCanvasState;

			const eventId = newEventId();
			nextState = addHistory(eventId, nextState);

			return nextState;
		});
	}, []);
};
