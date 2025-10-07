import { useCallback, useRef } from "react";

import type { DiagramDragEvent } from "../../../types/events/DiagramDragEvent";
import type { Diagram } from "../../../types/state/core/Diagram";
import type { GroupState } from "../../../types/state/shapes/GroupState";
import { collectDiagramIds } from "../../../utils/core/collectDiagramIds";
import { getSelectedDiagrams } from "../../../utils/core/getSelectedDiagrams";
import { refreshConnectLines } from "../../../utils/shapes/connectLine/refreshConnectLines";
import { isTransformativeState } from "../../../utils/validation/isTransformativeState";
import { InteractionState } from "../../types/InteractionState";
import type { SvgCanvasState } from "../../types/SvgCanvasState";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";
import { adjustCanvasFrameSizesAndRefreshConnections } from "../../utils/adjustCanvasFrameSizesAndRefreshConnections";
import {
	createDiagramPathIndex,
	type DiagramPathIndex,
} from "../../utils/createDiagramPathIndex";
import { createItemMap } from "../../utils/createItemMap";
import { updateDiagramConnectPoints } from "../../utils/updateDiagramConnectPoints";
import { updateDiagramsByPath } from "../../utils/updateDiagramsByPath";
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
	// Reference to store initial items at the start of drag.
	const initialItemsMap = useRef<Map<string, Diagram>>(new Map());
	// Reference to store initial multi select group
	const initialMultiSelectGroup = useRef<GroupState | undefined>(undefined);
	// Reference to store path index for efficient updates
	const pathIndex = useRef<DiagramPathIndex>(new Map());

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

				// Store initial items map
				initialItemsMap.current = createItemMap(prevState.items);

				// Store initial multi select group
				if (prevState.multiSelectGroup) {
					initialMultiSelectGroup.current = prevState.multiSelectGroup;
				}

				// Collect all IDs that need to be updated (selected + their descendants)
				const selectedItems = getSelectedDiagrams(prevState.items);
				const targetIds = new Set(collectDiagramIds(selectedItems));

				// Create path index for efficient updates
				pathIndex.current = createDiagramPathIndex(prevState.items, targetIds);
			}

			// Calculate the movement delta
			const dx = e.endX - e.startX;
			const dy = e.endY - e.startY;

			// Get initial items from ref (stored at drag start)
			const initialItems = initialItemsMap.current;

			// Collect all diagrams that will be moved (for connect point updates)
			const movedDiagrams: Diagram[] = [];

			// Use path-based update for efficient diagram updates
			const updateDiagram = (diagram: Diagram): Diagram => {
				const initialItem = initialItems.get(diagram.id);
				if (!initialItem) {
					return diagram;
				}

				let newItem = {
					...diagram,
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

				return newItem;
			};

			// Create the new state using path-based updates
			let newState: SvgCanvasState = {
				...prevState,
				items: updateDiagramsByPath(
					prevState.items,
					pathIndex.current,
					updateDiagram,
				),
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
				newState.items = updateDiagramsByPath(
					newState.items,
					pathIndex.current,
					(item: Diagram) => {
						if (isTransformativeState(item)) {
							const initialItem = initialItems.get(item.id);
							if (initialItem && isTransformativeState(initialItem)) {
								return {
									...item,
									showTransformControls: initialItem.showTransformControls,
								};
							}
						}
						return item;
					},
				);

				// Adjust canvas frame sizes and refresh connections
				newState = adjustCanvasFrameSizesAndRefreshConnections(
					newState,
					startCanvasState.current,
				);

				// Update outline of all groups.
				newState.items = updateOutlineOfAllItemables(newState.items);

				// Add history and get updated state
				newState = addHistory(e.eventId, newState);

				// Clean up references
				startCanvasState.current = undefined;
				initialItemsMap.current.clear();
				initialMultiSelectGroup.current = undefined;
				pathIndex.current.clear();
			}

			return newState;
		});
	}, []);
};
