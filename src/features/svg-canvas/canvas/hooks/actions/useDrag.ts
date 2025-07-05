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
import { getSelectedItems } from "../../../utils/common/getSelectedItems";
import { isConnectableData } from "../../../utils/validation/isConnectableData";
import { isItemableData } from "../../../utils/validation/isItemableData";
import { isTransformativeData } from "../../../utils/validation/isTransformativeData";
import { addHistory } from "../../utils/addHistory";
import { applyFunctionRecursively } from "../../utils/applyFunctionRecursively";
import { isDiagramChangingEvent } from "../../utils/isDiagramChangingEvent";
import { isHistoryEvent } from "../../utils/isHistoryEvent";
import { svgCanvasStateToData } from "../../utils/svgCanvasStateToData";
import { updateOutlineOfAllGroups } from "../../utils/updateOutlineOfAllGroups";
import { refreshConnectLines } from "../../../utils/shapes/connectLine/refreshConnectLines";
import { createMultiSelectGroup } from "../../utils/createMultiSelectGroup";
import { createItemMap } from "../../utils/createItemMap";

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
	// Reference to store the canvas state at the start of drag for connect line updates.
	const startCanvasState = useRef<SvgCanvasState | undefined>(undefined);
	// Reference to store selected item IDs at the start of drag for performance.
	const selectedItemIds = useRef<Set<string>>(new Set());
	// Reference to store initial items at the start of drag.
	const initialItemsMap = useRef<Map<string, Diagram>>(new Map());

	// Return a callback function to handle the drag event.
	return useCallback((e: DiagramDragEvent) => {
		// Bypass references to avoid function creation in every render.
		const {
			props: { setCanvasState, onDataChange },
			autoEdgeScroll,
		} = refBus.current;

		// Update the canvas state based on the drag event.
		setCanvasState((prevState) => {
			// Check if currently dragging
			const isDragging =
				e.eventType === "Start" || e.eventType === "InProgress";

			// Store the current canvas state for connect line updates on drag start
			if (e.eventType === "Start") {
				startCanvasState.current = prevState;

				// Store selected item IDs for performance
				const selectedItems = getSelectedItems(prevState.items);
				selectedItemIds.current = new Set(selectedItems.map((item) => item.id));
				// Store initial items map
				initialItemsMap.current = createItemMap(prevState.items);
			}

			// Calculate the movement delta
			const dx = e.endX - e.startX;
			const dy = e.endY - e.startY;

			// Get selected item IDs from ref (stored at drag start)
			const selectedIds = selectedItemIds.current;
			// Get initial items from ref (stored at drag start)
			const initialItems = initialItemsMap.current;

			// Collect all diagrams that will be moved (for connect point updates)
			const movedDiagrams: Diagram[] = [];

			// TODO: 関数化
			// Function to update connect points of a moved item
			const updateConnectPoints = (item: Diagram) => {
				if (isConnectableData(item)) {
					const calculator = DiagramRegistry.getConnectPointCalculator(
						item.type,
					);
					if (calculator) {
						item.connectPoints = calculator(item).map((c) => ({
							...c,
							type: "ConnectPoint",
						})) as ConnectPointData[];
					}
				}
			};

			// Function to recursively move items and update their positions
			const moveRecursively = (items: Diagram[]): Diagram[] => {
				return items.map((item) => {
					// If this item is selected, move it
					if (selectedIds.has(item.id)) {
						const initialItem = initialItems.get(item.id);
						if (!initialItem) {
							// If no initial item found, return item unchanged
							return item;
						}

						const newItem = {
							...item,
							x: initialItem.x + dx,
							y: initialItem.y + dy,
							isDragging,
						};

						// Hide transform controls during drag for transformative items
						if (isTransformativeData(newItem) && isDragging) {
							newItem.showTransformControls = false;
						}

						// Update connect points
						updateConnectPoints(newItem);
						movedDiagrams.push(newItem);

						// If the item has children, move them recursively
						if (isItemableData(newItem)) {
							newItem.items = applyFunctionRecursively(
								newItem.items,
								(childItem) => {
									// Move child items by the same delta
									const childInitialItem = initialItems.get(childItem.id);
									if (childInitialItem) {
										const newChildItem = {
											...childItem,
											x: childInitialItem.x + dx,
											y: childInitialItem.y + dy,
											isDragging,
										};

										// Hide transform controls during drag for transformative items
										if (isTransformativeData(newChildItem) && isDragging) {
											newChildItem.showTransformControls = false;
										}

										// Update connect points
										updateConnectPoints(newChildItem);
										movedDiagrams.push(newChildItem);

										return newChildItem;
									}
									return childItem; // If no initial item, return unchanged
								},
							);
						}

						return newItem;
					}
					if (isItemableData(item)) {
						// If the item is not selected, recursively move its children
						item.items = moveRecursively(item.items);
					}
					return item; // If not selected, return item unchanged
				});
			};

			// Create the new state
			let newState: SvgCanvasState = {
				...prevState,
				items: moveRecursively(prevState.items),
				isDiagramChanging: isDiagramChangingEvent(e.eventType),
			};

			// If multiple items are selected, create a multi-select group
			if (prevState.multiSelectGroup) {
				newState.multiSelectGroup = createMultiSelectGroup(
					movedDiagrams,
					prevState.multiSelectGroup?.keepProportion,
				);
			}

			// Refresh the connect lines for the moved diagrams
			newState = refreshConnectLines(
				movedDiagrams,
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
				// Restore showTransformControls from initial state for transformative items
				newState.items = applyFunctionRecursively(newState.items, (item) => {
					if (selectedIds.has(item.id) && isTransformativeData(item)) {
						const initialItem = initialItems.get(item.id);
						if (initialItem && isTransformativeData(initialItem)) {
							return {
								...item,
								showTransformControls: initialItem.showTransformControls,
							};
						}
					}
					return item;
				});
				// Update outline of all groups.
				newState.items = updateOutlineOfAllGroups(newState.items);
				// Clean up the canvas state reference.
				startCanvasState.current = undefined;
				// Clean up the selected item IDs and initial items map.
				selectedItemIds.current.clear();
				initialItemsMap.current.clear();
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
