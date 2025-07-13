// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { Diagram } from "../../../types/data/catalog/Diagram";
import type { GroupData } from "../../../types/data/shapes/GroupData";
import type { ConnectPointMoveData } from "../../../types/events/ConnectPointMoveData";
import type { DiagramChangeEvent } from "../../../types/events/DiagramChangeEvent";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";

// Import components related to SvgCanvas.
import { notifyConnectPointsMove } from "../../../components/shapes/ConnectLine";

// Import hooks related to SvgCanvas.
import { useAutoEdgeScroll } from "../navigation/useAutoEdgeScroll";

// Import functions related to SvgCanvas.
import { isItemableData } from "../../../utils/validation/isItemableData";
import { isSelectableData } from "../../../utils/validation/isSelectableData";
import { addHistory } from "../../utils/addHistory";
import { applyFunctionRecursively } from "../../utils/applyFunctionRecursively";
import { isDiagramChangingEvent } from "../../utils/isDiagramChangingEvent";
import { isHistoryEvent } from "../../utils/isHistoryEvent";
import { svgCanvasStateToData } from "../../utils/svgCanvasStateToData";
import { updateConnectPointsAndCollectRecursive } from "../../utils/updateConnectPointsAndCollectRecursive";
import { updateOutlineOfAllGroups } from "../../utils/updateOutlineOfAllGroups";

// Imports related to this component.
import { MULTI_SELECT_GROUP } from "../../SvgCanvasConstants";
import type { SvgCanvasState } from "../../types/SvgCanvasState";

/**
 * Custom hook to handle diagram change events on the canvas.
 */
export const useDiagramChange = (props: SvgCanvasSubHooksProps) => {
	// Get the auto edge scroll function to handle canvas auto scrolling.
	const { autoEdgeScroll } = useAutoEdgeScroll(props);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
		autoEdgeScroll,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback((e: DiagramChangeEvent) => {
		// Bypass references to avoid function creation in every render.
		const {
			props: { setCanvasState, onDataChange },
			autoEdgeScroll,
		} = refBus.current;

		setCanvasState((prevState) => {
			let items = prevState.items;
			let multiSelectGroup: GroupData | undefined = prevState.multiSelectGroup;

			const connectPointMoveDataList: ConnectPointMoveData[] = [];

			if (e.id === MULTI_SELECT_GROUP) {
				// The case of multi-select group change.

				// Update the multi-select group with the new properties.
				multiSelectGroup = {
					...multiSelectGroup,
					...e.endDiagram,
				} as GroupData;

				// Update the connect points of the multi-select group.
				if (e.changeType !== "Appearance") {
					updateConnectPointsAndCollectRecursive(
						multiSelectGroup,
						connectPointMoveDataList,
					);
				} // Propagate the multi-select group changes to the original diagrams.
				items = applyFunctionRecursively(prevState.items, (item) => {
					if (!isItemableData<Diagram>(e.endDiagram)) return item; // Type guard with Diagram type

					// Find the corresponding change data in the multi-select group.
					const changedItem = (e.endDiagram.items ?? []).find(
						(i) => i.id === item.id,
					);

					// If there is no corresponding change data, return the original item.
					if (!changedItem) return item;

					// Prepare the new item with the original properties.
					let newItem = { ...item };

					if (isSelectableData(changedItem)) {
						// Remove the isSelected property that is not needed for the update.
						const { isSelected, ...updateItem } = changedItem;

						// Apply the updated properties to the original item.
						newItem = {
							...newItem,
							...updateItem,
						};
					}

					return newItem;
				});
			} else {
				// The case of single diagram change.
				items = applyFunctionRecursively(prevState.items, (item) => {
					// If the id does not match, return the original item.
					if (item.id !== e.id) return item;

					// If the id matches, update the item with the new properties.
					const newItem = { ...item, ...e.endDiagram };

					// Update the diagram's connect points and collect their move data.
					if (e.changeType !== "Appearance") {
						updateConnectPointsAndCollectRecursive(
							newItem,
							connectPointMoveDataList,
						);
					}

					// Return the updated item.
					return newItem;
				});

				if (multiSelectGroup) {
					// When a multi-select group is present, propagate the original diagram changes to its items.
					// In this case, the changes are appearance only, so we don't need to update the connect points.
					multiSelectGroup.items = applyFunctionRecursively(
						multiSelectGroup.items,
						(item) =>
							item.id === e.id
								? { ...item, ...e.endDiagram, isSelected: false }
								: item,
					);
				}
			}

			// Update outline of all groups.
			items = updateOutlineOfAllGroups(items);

			// Create a new state with the updated items and multi-select group.
			let newState = {
				...prevState,
				items,
				isDiagramChanging: isDiagramChangingEvent(e.eventType),
				multiSelectGroup,
			} as SvgCanvasState;

			if (isHistoryEvent(e.eventType)) {
				// Add a new history entry.
				newState.lastHistoryEventId = e.eventId;
				newState = addHistory(prevState, newState);

				// Notify the data change.
				onDataChange?.(svgCanvasStateToData(newState));
			}

			if (0 < connectPointMoveDataList.length) {
				// Notify the connect points move event to the ConnectLine component.
				notifyConnectPointsMove({
					eventId: e.eventId,
					eventType: e.eventType,
					points: connectPointMoveDataList,
				});
			}

			return newState;
		});
		// Auto scroll if the cursor is near the edges.
		if (e.cursorX !== undefined && e.cursorY !== undefined) {
			autoEdgeScroll({
				cursorX: e.cursorX,
				cursorY: e.cursorY,
			});
		}
	}, []);
};
