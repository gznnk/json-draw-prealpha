// Import React.
import { useEffect, useRef } from "react";

// Import types.
import type { GroupShapesEvent } from "../../../types/events/GroupShapesEvent";
import type { Diagram } from "../../../types/state/core/Diagram";
import type { ConnectLineState } from "../../../types/state/shapes/ConnectLineState";
import type { GroupState } from "../../../types/state/shapes/GroupState";
import type { SvgCanvasState } from "../../types/SvgCanvasState";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";

// Import constants.
import { EVENT_NAME_GROUP_SHAPES } from "../../../constants/core/EventNames";

// Import utils.
import { getDiagramById } from "../../../utils/core/getDiagramById";
import { calcUnrotatedItemableBoundingBox } from "../../../utils/core/calcUnrotatedItemableBoundingBox";
import { isConnectLineState } from "../../../utils/validation/isConnectLineState";
import { cleanupGroups } from "../../utils/cleanupGroups";
import { collectDiagramIds } from "../../utils/collectDiagramIds";
import { updateOutlineOfAllItemables } from "../../utils/updateOutlineOfAllItemables";

// Import hooks.
import { useAddHistory } from "../history/useAddHistory";

/**
 * Hook that monitors GroupShapes events and performs shape grouping.
 */
export const useOnGroupShapes = (props: SvgCanvasSubHooksProps) => {
	// Get the data change handler.
	const addHistory = useAddHistory(props);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
		addHistory,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	useEffect(() => {
		// Bypass references to avoid function creation in every render.
		const { eventBus } = refBus.current.props;

		const groupShapesListener = (e: Event) => {
			// Bypass references to avoid function creation in every render.
			const { props, addHistory } = refBus.current;
			const { setCanvasState } = props;

			const event = (e as CustomEvent<GroupShapesEvent>).detail;

			setCanvasState((prevState) => {
				// Find diagrams by IDs
				const targetDiagrams = event.shapeIds
					.map((id) => getDiagramById(prevState.items, id))
					.filter((diagram): diagram is Diagram => diagram !== null);

				if (targetDiagrams.length < 2) {
					console.error("Not enough valid shapes found for grouping.");
					return prevState;
				}

				// Calculate bounding box for the group
				const boundingBox = calcUnrotatedItemableBoundingBox(targetDiagrams);

				// Create a new group data.
				const group: GroupState = {
					x: boundingBox.left + (boundingBox.right - boundingBox.left) / 2,
					y: boundingBox.top + (boundingBox.bottom - boundingBox.top) / 2,
					width: boundingBox.right - boundingBox.left,
					height: boundingBox.bottom - boundingBox.top,
					rotation: 0,
					scaleX: 1,
					scaleY: 1,
					keepProportion: true,
					itemableType: "abstract",
					id: event.groupId,
					type: "Group",
					isSelected: false,
					showOutline: false,
					showTransformControls: false,
					isTransforming: false,
					items: targetDiagrams,
				};

				// Remove target diagrams from items
				const remainingItems = prevState.items.filter(
					(item) => !event.shapeIds.includes(item.id),
				);
				const groupsCleanedUpItems = cleanupGroups(remainingItems);
				const mergedItems = [...groupsCleanedUpItems, group];

				// Bring connect lines forward that are connected to grouped components.
				const groupedDiagramIds = collectDiagramIds(targetDiagrams);
				const targetConnectLines: ConnectLineState[] = [];
				for (const diagram of mergedItems) {
					if (
						isConnectLineState(diagram) &&
						(groupedDiagramIds.includes(diagram.startOwnerId) ||
							groupedDiagramIds.includes(diagram.endOwnerId))
					) {
						targetConnectLines.push(diagram);
					}
				}
				const orderedItems = [
					...mergedItems.filter(
						(item) =>
							!targetConnectLines.some(
								(connectLine) => connectLine.id === item.id,
							),
					),
					...targetConnectLines,
				];

				const outlineUpdatedItems = updateOutlineOfAllItemables(orderedItems);

				// Create next state
				let nextState = {
					...prevState,
					items: outlineUpdatedItems,
					multiSelectGroup: undefined,
				} as SvgCanvasState;

				// Add history
				nextState = addHistory(event.eventId, nextState);

				return nextState;
			});
		};

		eventBus.addEventListener(EVENT_NAME_GROUP_SHAPES, groupShapesListener);

		return () => {
			eventBus.removeEventListener(
				EVENT_NAME_GROUP_SHAPES,
				groupShapesListener,
			);
		};
	}, []);
};
