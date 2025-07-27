// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { Diagram } from "../../../types/data/catalog/Diagram";
import type { DiagramDragEvent } from "../../../types/events/DiagramDragEvent";
import { InteractionState } from "../../types/InteractionState";
import type { SvgCanvasState } from "../../types/SvgCanvasState";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";

// Import constants.
import { AUTO_SCROLL_INTERVAL_MS } from "../../SvgCanvasConstants";

// Import utils.
import { getSelectedItems } from "../../../utils/common/getSelectedItems";
import { refreshConnectLines } from "../../../utils/shapes/connectLine/refreshConnectLines";
import { isItemableData } from "../../../utils/validation/isItemableData";
import { isTransformativeData } from "../../../utils/validation/isTransformativeData";
import { addHistory } from "../../utils/addHistory";
import { applyFunctionRecursively } from "../../utils/applyFunctionRecursively";
import { calculateScrollDelta } from "../../utils/calculateScrollDelta";
import { createItemMap } from "../../utils/createItemMap";
import { createMultiSelectGroup } from "../../utils/createMultiSelectGroup";
import { detectEdgeProximity } from "../../utils/detectEdgeProximity";
import { svgCanvasStateToData } from "../../utils/svgCanvasStateToData";
import { updateDiagramConnectPoints } from "../../utils/updateDiagramConnectPoints";
import { updateOutlineOfAllGroups } from "../../utils/updateOutlineOfAllGroups";

/**
 * Custom hook to handle drag events on the canvas.
 */
export const useOnDrag = (props: SvgCanvasSubHooksProps) => {
	// Internal state for edge scrolling
	const scrollIntervalRef = useRef<number | null>(null);
	const isScrollingRef = useRef(false);
	const currentStartPosRef = useRef<{
		x: number;
		y: number;
	} | null>(null);
	// Combined reference for edge scrolling state to ensure consistency
	const edgeScrollStateRef = useRef<{
		endPos: { x: number; y: number } | null;
		delta: { x: number; y: number };
	}>({
		endPos: null,
		delta: { x: 0, y: 0 },
	});

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;
	// Reference to store the canvas state at the start of drag for connect line updates.
	const startCanvasState = useRef<SvgCanvasState | undefined>(undefined);
	// Reference to store selected item IDs at the start of drag for performance.
	const selectedItemIds = useRef<Set<string>>(new Set());
	// Reference to store initial items at the start of drag.
	const initialItemsMap = useRef<Map<string, Diagram>>(new Map());

	/**
	 * Clear edge scrolling interval and reset state
	 */
	const clearEdgeScroll = useCallback(() => {
		if (scrollIntervalRef.current !== null) {
			clearInterval(scrollIntervalRef.current);
			scrollIntervalRef.current = null;
		}
		isScrollingRef.current = false;
		edgeScrollStateRef.current = { endPos: null, delta: { x: 0, y: 0 } };
	}, []);

	/**
	 * Start edge scrolling with calculated delta values
	 */
	const startEdgeScroll = useCallback(() => {
		// Mark scrolling as active
		isScrollingRef.current = true;

		// Execute scroll processing immediately
		const executeScroll = () => {
			const startPos = currentStartPosRef.current;
			if (!startPos) {
				return;
			}

			const { endPos, delta } = edgeScrollStateRef.current;
			if (!endPos) {
				return;
			}

			const { setCanvasState } = refBus.current.props;

			// Update cursor position with deltas
			const zoom = refBus.current.props.canvasState.zoom;
			const newEndPos = {
				x: endPos.x + delta.x / zoom,
				y: endPos.y + delta.y / zoom,
			};

			// Update edge scroll state atomically
			edgeScrollStateRef.current = { endPos: newEndPos, delta };

			const dx = newEndPos.x - startPos.x;
			const dy = newEndPos.y - startPos.y;

			const newState = createDraggedState(
				refBus.current.props.canvasState,
				dx,
				dy,
				true,
			);

			// Update canvas state with new scroll position
			setCanvasState((prevState) => ({
				...prevState,
				...newState,
				minX: prevState.minX + delta.x,
				minY: prevState.minY + delta.y,
			}));
		};

		// Execute immediately
		executeScroll();

		// Continue with interval
		scrollIntervalRef.current = window.setInterval(
			executeScroll,
			AUTO_SCROLL_INTERVAL_MS,
		);
	}, []);

	/**
	 * Create a new state based on the drag event.
	 */
	const createDraggedState = useCallback(
		(
			prevState: SvgCanvasState,
			dx: number,
			dy: number,
			isDragging: boolean,
		): SvgCanvasState => {
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
						if (isTransformativeData(newItem) && isDragging) {
							newItem.showTransformControls = false;
						}

						// Update connect points
						newItem = updateDiagramConnectPoints(newItem);

						// Add the moved item to the list
						movedDiagrams.push(newItem);

						// If the item has children, move them recursively
						if (isItemableData(newItem)) {
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
										if (isTransformativeData(newChildItem) && isDragging) {
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
				interactionState: isDragging
					? InteractionState.Dragging
					: InteractionState.Idle,
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

			return newState;
		},
		[],
	);

	// Return a callback function to handle the drag event.
	return useCallback(
		(e: DiagramDragEvent) => {
			// Bypass references to avoid function creation in every render.
			const {
				props: { setCanvasState, onDataChange },
			} = refBus.current;

			// Check if we need to start edge scrolling
			const edgeProximity = detectEdgeProximity(
				refBus.current.props,
				e.cursorX,
				e.cursorY,
			);

			if (edgeProximity.isNearEdge) {
				// Calculate scroll delta and update edge scroll state atomically
				const { deltaX, deltaY } = calculateScrollDelta(
					edgeProximity.horizontal,
					edgeProximity.vertical,
				);
				edgeScrollStateRef.current = { 
					endPos: { x: e.endX, y: e.endY }, 
					delta: { x: deltaX, y: deltaY } 
				};

				if (!isScrollingRef.current) {
					// If scrolling is not active, start edge scrolling
					startEdgeScroll();
				}
				return;
			}

			if (isScrollingRef.current) {
				// If not near an edge, clear edge scrolling
				clearEdgeScroll();
			}

			// Update the canvas state based on the drag event.
			setCanvasState((prevState) => {
				// Check if currently dragging
				const isDragging =
					e.eventType === "Start" || e.eventType === "InProgress";

				// Store the current canvas state for connect line updates on drag start
				if (e.eventType === "Start") {
					startCanvasState.current = prevState;

					// Store the initial start position
					currentStartPosRef.current = { x: e.startX, y: e.startY };
					// Store selected item IDs for performance
					const selectedItems = getSelectedItems(prevState.items);
					selectedItemIds.current = new Set(
						selectedItems.map((item) => item.id),
					);
					// Store initial items map
					initialItemsMap.current = createItemMap(prevState.items);
				}

				// Calculate the movement delta
				const dx = e.endX - e.startX;
				const dy = e.endY - e.startY;

				// Create the new state based on the dx and dy values
				let newState = createDraggedState(prevState, dx, dy, isDragging);

				// If the event has minX and minY, update the canvas state
				if (e.minX !== undefined && e.minY !== undefined) {
					newState.minX = e.minX;
					newState.minY = e.minY;
				}

				// If the drag event is ended
				if (e.eventType === "End") {
					// Clear auto edge scroll when drag ends
					clearEdgeScroll();

					// Get selected item IDs from ref (stored at drag start)
					const selectedIds = selectedItemIds.current;
					// Get initial items from ref (stored at drag start)
					const initialItems = initialItemsMap.current;

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

					// Add a new history entry.
					newState.lastHistoryEventId = e.eventId;
					newState = addHistory(prevState, newState);

					// Notify the data change.
					onDataChange?.(svgCanvasStateToData(newState));

					// Clean up the canvas state reference.
					startCanvasState.current = undefined;
					// Clean up the selected item IDs and initial items map.
					selectedItemIds.current.clear();
					initialItemsMap.current.clear();
				}

				return newState;
			});
		},
		[createDraggedState, startEdgeScroll, clearEdgeScroll],
	);
};
