// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { Diagram } from "../../../types/data/catalog/Diagram";
import type { DiagramDragEvent } from "../../../types/events/DiagramDragEvent";
import type { CanvasHooksProps, SvgCanvasState } from "../../SvgCanvasTypes";

// Import hooks related to SvgCanvas.
import { useAutoEdgeScroll } from "../navigation/useAutoEdgeScroll";

// Import functions related to SvgCanvas.
import { DiagramRegistry } from "../../../registry";
import type { ConnectPointData } from "../../../types/data/shapes/ConnectPointData";
import { isConnectableData } from "../../../utils/validation/isConnectableData";
import { isItemableData } from "../../../utils/validation/isItemableData";
import { isSelectableData } from "../../../utils/validation/isSelectableData";
import { addHistory } from "../../utils/addHistory";
import { applyRecursive } from "../../utils/applyRecursive";
import { getAncestorItemsById } from "../../utils/getAncestorItemsById";
import { getDiagramById } from "../../../utils/common/getDiagramById";
import { isDiagramChangingEvent } from "../../utils/isDiagramChangingEvent";
import { isHistoryEvent } from "../../utils/isHistoryEvent";
import { svgCanvasStateToData } from "../../utils/svgCanvasStateToData";
import { updateOutlineOfAllGroups } from "../../utils/updateOutlineOfAllGroups";
import { refreshConnectLines } from "../../../utils/shapes/connectLine/refreshConnectLines";

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
	// Reference to store the canvas state at the start of drag for connect line updates.
	const startCanvasState = useRef<SvgCanvasState | undefined>(undefined);

	// Return a callback function to handle the drag event.
	return useCallback((e: DiagramDragEvent) => {
		// Bypass references to avoid function creation in every render.
		const {
			props: { setCanvasState, onDataChange },
			autoEdgeScroll,
		} = refBus.current;

		setCanvasState((prevState) => {
			// Remember the ancestor items of the dragged item on the drag start event.
			if (e.eventType === "Start") {
				// Store the current canvas state for connect line updates
				startCanvasState.current = prevState;

				ancestors.current = getAncestorItemsById(e.id, prevState);
				if (ancestors.current.length > 0) {
					selectedAncestorItem.current = ancestors.current.find(
						(item) => isSelectableData(item) && item.isSelected,
					);
				}
			}

			// Updated state to be returned.
			let newState: SvgCanvasState;
			// Dragged diagrams to be updated.
			const draggedDiagrams: Diagram[] = [];

			// TODO: Generailize function.
			// Function to update connect points of the dragged item.
			const updateConnectPoints = (item: Diagram) => {
				if (isConnectableData(item)) {
					const calculator = DiagramRegistry.getConnectPointCalculator(
						item.type,
					);
					if (calculator) {
						// TODO: Diractly create connect points data.
						// Update the connect points of the item.
						item.connectPoints = calculator(item).map((c) => ({
							...c,
							type: "ConnectPoint",
						})) as ConnectPointData[];
						draggedDiagrams.push(item);
					}
				}
			};

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
							const newItem = {
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
									const newChildItem = {
										...childItem,
										x: startItem.x + dx,
										y: startItem.y + dy,
									};

									// Update the connect points of the child item.
									updateConnectPoints(newChildItem);

									return newChildItem;
								}),
							};

							// Update the connect points of the ancestor item.
							updateConnectPoints(newItem);

							return newItem;
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

							// Update the connect points of the dragged item.
							updateConnectPoints(newItem);

							return newItem;
						}
						return item;
					}),
				};
			}

			// Update isDiagramChanging state based on the event type.
			newState.isDiagramChanging = isDiagramChangingEvent(e.eventType);

			// Refresh the connect lines for the dragged diagrams.
			newState = refreshConnectLines(
				draggedDiagrams,
				newState,
				startCanvasState.current,
			);

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
				startCanvasState.current = undefined;
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
