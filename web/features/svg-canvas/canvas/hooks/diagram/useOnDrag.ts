import { useCallback, useRef } from "react";

import type { DiagramPathIndex } from "../../../types/core/DiagramPath";
import type { DiagramDragEvent } from "../../../types/events/DiagramDragEvent";
import type { Diagram } from "../../../types/state/core/Diagram";
import type { GroupState } from "../../../types/state/shapes/GroupState";
import { collectDiagramIds } from "../../../utils/core/collectDiagramIds";
import { getSelectedDiagrams } from "../../../utils/core/getSelectedDiagrams";
import { collectConnectedConnectLines } from "../../../utils/shapes/connectLine/collectConnectedConnectLines";
import { updateConnectLinesByIds } from "../../../utils/shapes/connectLine/updateConnectLinesByIds";
import { isItemableState } from "../../../utils/validation/isItemableState";
import { isTransformativeState } from "../../../utils/validation/isTransformativeState";
import { InteractionState } from "../../types/InteractionState";
import type { SvgCanvasState } from "../../types/SvgCanvasState";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";
import { createDiagramPathIndex } from "../../utils/createDiagramPathIndex";
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
	// Reference to store ConnectLine IDs that need to be updated
	const connectedConnectLineIds = useRef<Set<string>>(new Set());

	// Return a callback function to handle the drag event.
	return useCallback((e: DiagramDragEvent) => {
		// Bypass references to avoid function creation in every render.
		const {
			props: { setCanvasState, onPanZoomChange },
		} = refBus.current;
		const { addHistory } = refBus.current;

		// Update the canvas state based on the drag event.
		setCanvasState((prevState) => {
			// Store the current canvas state for connect line updates on drag start
			if (e.eventPhase === "Started") {
				startCanvasState.current = prevState;

				// Store initial items map
				initialItemsMap.current = createItemMap(prevState.items);

				// Store initial multi select group
				if (prevState.multiSelectGroup) {
					initialMultiSelectGroup.current = prevState.multiSelectGroup;
				}

				// Create path index for selected diagrams only (children will be updated recursively)
				const selectedItems = getSelectedDiagrams(prevState.items);
				const selectedIds = new Set(selectedItems.map((item) => item.id));

				// Create path index for efficient updates
				pathIndex.current = createDiagramPathIndex(
					prevState.items,
					selectedIds,
				);

				// Collect all diagram IDs that will be moved (selected + their descendants)
				const allMovedDiagramIds = collectDiagramIds(selectedItems);

				// Collect ConnectLine IDs that are connected to any of the moved diagrams
				const connectLineIds = collectConnectedConnectLines(
					prevState.items,
					allMovedDiagramIds,
				);
				connectedConnectLineIds.current = connectLineIds;
			}

			// Calculate the movement delta
			const dx = e.endX - e.startX;
			const dy = e.endY - e.startY;

			// Check if currently dragging
			const isDragging =
				e.eventPhase === "Started" || e.eventPhase === "InProgress";

			// Get initial items from ref (stored at drag start)
			const initialItems = initialItemsMap.current;

			// Recursively update diagram and all its descendants
			const updateDiagramRecursively = (diagram: Diagram): Diagram => {
				const initialItem = initialItems.get(diagram.id);
				if (!initialItem) return diagram;

				// Update position and dragging state
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

				// Recursively update children if this diagram has them
				if (isItemableState(newItem)) {
					newItem = {
						...newItem,
						items: newItem.items.map(updateDiagramRecursively),
					} as Diagram;
				}

				return newItem;
			};

			// Create the new state using path-based updates (only for selected diagrams, children updated recursively)
			let newState: SvgCanvasState = {
				...prevState,
				items: updateDiagramsByPath(
					prevState.items,
					pathIndex.current,
					updateDiagramRecursively,
				),
				interactionState: isDragging
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

			// Refresh the connect lines using cached ConnectLine IDs
			newState = updateConnectLinesByIds(
				connectedConnectLineIds.current,
				newState,
				startCanvasState.current,
			);

			// If the drag event is ended
			if (e.eventPhase === "Ended") {
				// Restore showTransformControls from initial state for transformative items (recursively)
				const restoreTransformControls = (diagram: Diagram): Diagram => {
					let updated = diagram;

					if (isTransformativeState(diagram)) {
						const initialItem = initialItems.get(diagram.id);
						if (initialItem && isTransformativeState(initialItem)) {
							updated = {
								...diagram,
								showTransformControls: initialItem.showTransformControls,
							} as Diagram;
						}
					}

					// Recursively restore for children
					if (isItemableState(updated)) {
						updated = {
							...updated,
							items: updated.items.map(restoreTransformControls),
						} as Diagram;
					}

					return updated;
				};

				newState.items = updateDiagramsByPath(
					newState.items,
					pathIndex.current,
					restoreTransformControls,
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
				connectedConnectLineIds.current.clear();
			}

			return newState;
		});
	}, []);
};
