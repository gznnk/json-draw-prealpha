// Import React.
import { useEffect, useRef } from "react";

// Import types.
import type { GroupShapesEvent } from "../../../types/events/GroupShapesEvent";
import type { Diagram } from "../../../types/state/core/Diagram";
import type { GroupState } from "../../../types/state/shapes/GroupState";
import type { SvgCanvasState } from "../../types/SvgCanvasState";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";

// Import constants.
import { EVENT_NAME_GROUP_SHAPES } from "../../../constants/core/EventNames";

// Import utils.
import { getDiagramById } from "../../../utils/core/getDiagramById";
import { calcUnrotatedItemableBoundingBox } from "../../../utils/core/calcUnrotatedItemableBoundingBox";
import { cleanupGroups } from "../../utils/cleanupGroups";
import { updateOutlineOfAllItemables } from "../../utils/updateOutlineOfAllItemables";
import { bringConnectLinesForward } from "../../utils/bringConnectLinesForward";

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
					id: event.groupId,
					type: "Group",
					name: event.name,
					description: event.description,
					x: boundingBox.left + (boundingBox.right - boundingBox.left) / 2,
					y: boundingBox.top + (boundingBox.bottom - boundingBox.top) / 2,
					width: boundingBox.right - boundingBox.left,
					height: boundingBox.bottom - boundingBox.top,
					rotation: 0,
					scaleX: 1,
					scaleY: 1,
					keepProportion: true,
					itemableType: "abstract",
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
				const orderedItems = bringConnectLinesForward(
					mergedItems,
					targetDiagrams,
				);

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
