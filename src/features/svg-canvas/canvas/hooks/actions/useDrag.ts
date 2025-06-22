// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { DiagramDragEvent } from "../../../types/events/DiagramDragEvent";
import type { CanvasHooksProps, SvgCanvasState } from "../../SvgCanvasTypes";
import type { Diagram } from "../../../types/data/catalog/Diagram";

// Import hooks related to SvgCanvas.
import { useAutoEdgeScroll } from "../navigation/useAutoEdgeScroll";

// Import functions related to SvgCanvas.
import { addHistory } from "../../utils/addHistory";
import { applyRecursive } from "../../utils/applyRecursive";
import { isDiagramChangingEvent } from "../../utils/isDiagramChangingEvent";
import { isHistoryEvent } from "../../utils/isHistoryEvent";
import { svgCanvasStateToData } from "../../utils/svgCanvasStateToData";
import { updateConnectPointsAndNotifyMove } from "../../utils/updateConnectPointsAndNotifyMove";
import { updateOutlineOfAllGroups } from "../../utils/updateOutlineOfAllGroups";
import { isSelectableData } from "../../../utils/validation/isSelectableData";
import { isItemableData } from "../../../utils/validation/isItemableData";
import { getAncestorItemsById } from "../../utils/getAncestorItemsById";
import { getDiagramById } from "../../utils/getDiagramById";

/**
 * Custom hook to handle drag events on the canvas.
 */
export const useDrag = (props: CanvasHooksProps) => {
	// Get the auto edge scroll function to handle canvas auto scrolling.
	const autoEdgeScroll = useAutoEdgeScroll(props);
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
		autoEdgeScroll,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;
	// Reference to store ancestor items of the dragged item.
	const ancestors = useRef<Diagram[]>([]);
	// The selected ancestor item data of the dragged item at the start of the drag event.
	const selectedAncestorItem = useRef<Diagram | undefined>(undefined);

	return useCallback((e: DiagramDragEvent) => {
		// Bypass references to avoid function creation in every render.
		const {
			props: { setCanvasState, onDataChange },
			autoEdgeScroll,
		} = refBus.current;

		setCanvasState((prevState) => {
			// Remember the ancestor items of the dragged item on the drag start event.
			if (e.eventType === "Start") {
				ancestors.current = getAncestorItemsById(e.id, prevState);
				if (ancestors.current.length > 0) {
					selectedAncestorItem.current = ancestors.current.find(
						(item) => isSelectableData(item) && item.isSelected,
					);
				}
			}

			let newState: SvgCanvasState;

			if (
				selectedAncestorItem.current &&
				isItemableData(selectedAncestorItem.current)
			) {
				// If the dragged item is grouped, update the position of the ancestor and its children.
				const dx = e.endX - e.startX;
				const dy = e.endY - e.startY;

				// Get the items of the selected ancestor.
				const selectedAncestorItems = selectedAncestorItem.current.items;

				// Function to recursively search the ancestor and update the position of its children.
				const searchAncetorAndUpdateChildrenPosition = (
					items: Diagram[],
				): Diagram[] => {
					return items.map((item) => {
						// If the item is the selected ancestor, update its position and the position of its children.
						if (
							selectedAncestorItem.current &&
							item.id === selectedAncestorItem.current.id &&
							isItemableData(item)
						) {
							return {
								...item,
								x: selectedAncestorItem.current.x + dx,
								y: selectedAncestorItem.current.y + dy,
								items: applyRecursive(item.items, (childItem) => {
									const startItem = getDiagramById(
										selectedAncestorItems,
										childItem.id,
									);
									if (!startItem) {
										// If the child item is not found in the ancestor's items, return it unchanged.
										return childItem;
									}
									// Update the position of the child items.
									return {
										...childItem,
										x: startItem.x + dx,
										y: startItem.y + dy,
									};
								}),
							};
						}

						// If the item is a group, recursively search its children.
						if (isItemableData(item)) {
							return {
								...item,
								items: searchAncetorAndUpdateChildrenPosition(item.items),
							};
						}

						return item;
					});
				};

				newState = {
					...prevState,
					items: searchAncetorAndUpdateChildrenPosition(prevState.items),
				};
			} else {
				// If not group dragging, update the position of the dragged item directly.
				newState = {
					...prevState,
					items: applyRecursive(prevState.items, (item) => {
						if (item.id === e.id) {
							// Apply the new position to the item.
							const newItem = {
								...item,
								x: e.endX,
								y: e.endY,
							};

							// TODO: Update state in this function.
							// Update the connect points of the diagram.
							// And notify the connect points move event to ConnectLine.
							return updateConnectPointsAndNotifyMove(
								e.eventId,
								e.eventType,
								newItem,
							);
						}
						return item;
					}),
				};
			}

			// Update isDiagramChanging state based on the event type.
			newState.isDiagramChanging = isDiagramChangingEvent(e.eventType);

			if (isHistoryEvent(e.eventType)) {
				// Add a new history entry.
				newState.lastHistoryEventId = e.eventId;
				newState = addHistory(prevState, newState);

				// Notify the data change.
				onDataChange?.(svgCanvasStateToData(newState));
			}

			// If the drag event is ended
			if (e.eventType === "End") {
				// Update outline of all groups.
				newState.items = updateOutlineOfAllGroups(newState.items);
				// clean up the ancestor reference.
				ancestors.current = [];
				selectedAncestorItem.current = undefined;
			}

			return newState;
		});

		// Auto scroll if the cursor is near the edges.
		autoEdgeScroll({
			cursorX: e.cursorX,
			cursorY: e.cursorY,
		});
	}, []);
};
