import { useCallback, useRef } from "react";

import type { DiagramDragEvent } from "../../../types/events/DiagramDragEvent";
import type { Diagram } from "../../../types/state/core/Diagram";
import type { GroupState } from "../../../types/state/shapes/GroupState";
import { getSelectedDiagrams } from "../../../utils/core/getSelectedDiagrams";
import { refreshConnectLines } from "../../../utils/shapes/connectLine/refreshConnectLines";
import { isItemableState } from "../../../utils/validation/isItemableState";
import { isTransformativeState } from "../../../utils/validation/isTransformativeState";
import { InteractionState } from "../../types/InteractionState";
import type { SvgCanvasState } from "../../types/SvgCanvasState";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";
import { adjustCanvasFrameSizesAndRefreshConnections } from "../../utils/adjustCanvasFrameSizesAndRefreshConnections";
import { applyFunctionRecursively } from "../../utils/applyFunctionRecursively";
import { createItemMap } from "../../utils/createItemMap";
import { updateDiagramConnectPoints } from "../../utils/updateDiagramConnectPoints";
import { updateOutlineOfAllItemables } from "../../utils/updateOutlineOfAllItemables";
import { useAddHistory } from "../history/useAddHistory";

/**
 * Custom hook to handle drag events on the canvas.
 */
export const useOnDrag = (props: SvgCanvasSubHooksProps) => {
	// Get the data change handler.
	const addHistory = useAddHistory(props);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
		addHistory,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;
	// Reference to store the canvas state at the start of drag for connect line updates.
	const startCanvasState = useRef<SvgCanvasState | undefined>(undefined);
	// Reference to store selected item IDs at the start of drag for performance.
	const selectedItemIds = useRef<Set<string>>(new Set());
	// Reference to store initial items at the start of drag.
	const initialItemsMap = useRef<Map<string, Diagram>>(new Map());
	// Reference to store initial multi select group
	const initialMultiSelectGroup = useRef<GroupState | undefined>(undefined);

	// Return a callback function to handle the drag event.
	return useCallback((e: DiagramDragEvent) => {
		// Bypass references to avoid function creation in every render.
		const {
			props: { setCanvasState, onPanZoomChange },
		} = refBus.current;
		const { addHistory } = refBus.current;

		// Update the canvas state based on the drag event.
		setCanvasState((prevState) => {
			// Check if currently dragging
			const isDragging =
				e.eventPhase === "Started" || e.eventPhase === "InProgress";

			// Store the current canvas state for connect line updates on drag start
			if (e.eventPhase === "Started") {
				startCanvasState.current = prevState;

				// Store selected item IDs for performance
				const selectedItems = getSelectedDiagrams(prevState.items);
				selectedItemIds.current = new Set(selectedItems.map((item) => item.id));
				// Store initial items map
				initialItemsMap.current = createItemMap(prevState.items);
				// Store initial multi select group
				if (prevState.multiSelectGroup) {
					initialMultiSelectGroup.current = prevState.multiSelectGroup;
				}
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

						let newItem = {
							...item,
							x: initialItem.x + dx,
							y: initialItem.y + dy,
							isDragging,
						} as Diagram;

						// Hide transform controls during drag for transformative items
						if (isTransformativeState(newItem) && isDragging) {
							newItem.showTransformControls = false;
						}

						// Update connect points
						newItem = updateDiagramConnectPoints(newItem);

						// Add the moved item to the list
						movedDiagrams.push(newItem);

						// If the item has children, move them recursively
						if (isItemableState(newItem)) {
							newItem.items = applyFunctionRecursively(
								newItem.items,
								(childItem) => {
									// Move child items by the same delta
									const childInitialItem = initialItems.get(childItem.id);
									if (childInitialItem) {
										let newChildItem = {
											...childItem,
											x: childInitialItem.x + dx,
											y: childInitialItem.y + dy,
											isDragging,
										} as Diagram;

										// Hide transform controls during drag for transformative items
										if (isTransformativeState(newChildItem) && isDragging) {
											newChildItem.showTransformControls = false;
										}

										// Update connect points
										newChildItem = updateDiagramConnectPoints(newChildItem);

										// Add the moved item to the list
										movedDiagrams.push(newChildItem);

										return newChildItem;
									}
									return childItem; // If no initial item, return unchanged
								},
							);
						}

						return newItem;
					}
					if (isItemableState(item)) {
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
				interactionState:
					e.eventPhase === "Started" || e.eventPhase === "InProgress"
						? InteractionState.Dragging
						: InteractionState.Idle,
			};

			// If the event has minX and minY, update the canvas state
			if (e.minX !== undefined && e.minY !== undefined) {
				newState.minX = e.minX;
				newState.minY = e.minY;

				onPanZoomChange?.({
					minX: e.minX,
					minY: e.minY,
					zoom: newState.zoom,
				});
			}

			// If multiple items are selected, create a multi-select group
			if (prevState.multiSelectGroup && initialMultiSelectGroup.current) {
				newState.multiSelectGroup = {
					...prevState.multiSelectGroup,
					x: initialMultiSelectGroup.current.x + dx,
					y: initialMultiSelectGroup.current.y + dy,
				};
			}

			// Refresh the connect lines for the moved diagrams
			newState = refreshConnectLines(
				movedDiagrams,
				newState,
				startCanvasState.current,
			);

			// If the drag event is ended
			if (e.eventPhase === "Ended") {
				// Restore showTransformControls from initial state for transformative items
				newState.items = applyFunctionRecursively(newState.items, (item) => {
					if (selectedIds.has(item.id) && isTransformativeState(item)) {
						const initialItem = initialItems.get(item.id);
						if (initialItem && isTransformativeState(initialItem)) {
							return {
								...item,
								showTransformControls: initialItem.showTransformControls,
							};
						}
					}
					return item;
				});

				// Adjust canvas frame sizes and refresh connections
				newState = adjustCanvasFrameSizesAndRefreshConnections(
					newState,
					startCanvasState.current,
				);

				// Update outline of all groups.
				newState.items = updateOutlineOfAllItemables(newState.items);

				// Add history and get updated state
				newState = addHistory(e.eventId, newState);

				// Clean up the canvas state reference.
				startCanvasState.current = undefined;
				// Clean up the selected item IDs and initial items map.
				selectedItemIds.current.clear();
				initialItemsMap.current.clear();
				// Clean up initial multi select group
				initialMultiSelectGroup.current = undefined;
			}

			return newState;
		});
	}, []);
};
