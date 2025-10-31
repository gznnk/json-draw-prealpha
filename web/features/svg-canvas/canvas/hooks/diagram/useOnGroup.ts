import { useRef, useEffect } from "react";

import { GROUP_EVENT_NAME } from "../../../constants/core/EventNames";
import type { GroupEvent } from "../../../types/events/GroupEvent";
import type { GroupState } from "../../../types/state/shapes/GroupState";
import { newEventId } from "../../../utils/core/newEventId";
import { newId } from "../../../utils/shapes/common/newId";
import { isSelectableState } from "../../../utils/validation/isSelectableState";
import type { SvgCanvasState } from "../../types/SvgCanvasState";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";
import { addDiagramToParentOrRoot } from "../../utils/addDiagramToParentOrRoot";
import { applyFunctionRecursively } from "../../utils/applyFunctionRecursively";
import { bringConnectLinesForward } from "../../utils/bringConnectLinesForward";
import { cleanupGroups } from "../../utils/cleanupGroups";
import { findDiagramsById } from "../../utils/findDiagramsById";
import { findParentCanvasContainingAllDiagrams } from "../../utils/findParentCanvasContainingAllDiagrams";
import { removeDiagramsById } from "../../utils/removeDiagramsById";
import { removeItemsFromDiagram } from "../../utils/removeItemsFromDiagram";
import { updateOutlineOfAllItemables } from "../../utils/updateOutlineOfAllItemables";
import { useAddHistory } from "../history/useAddHistory";

/**
 * Custom hook to handle group events on the canvas.
 * Listens to GROUP_EVENT_NAME from the event bus and applies group operations.
 */
export const useOnGroup = (props: SvgCanvasSubHooksProps) => {
	const { eventBus, setCanvasState } = props;

	// Get the data change handler.
	const addHistory = useAddHistory(props);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		eventBus,
		setCanvasState,
		addHistory,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	// Listen to group events from the event bus
	useEffect(() => {
		const { eventBus } = refBus.current;

		const handleEvent = (event: Event) => {
			const customEvent = event as CustomEvent<GroupEvent>;
			const e = customEvent.detail;

			// Bypass references to avoid function creation in every render.
			const { setCanvasState, addHistory } = refBus.current;

			setCanvasState((prevState) => {
				// Find target diagrams to group
				const targetDiagrams = findDiagramsById(prevState.items, e.diagramIds);

				if (targetDiagrams.length < 2) {
					// Do not group if there are less than 2 diagrams
					console.error("Invalid diagram count for group operation.");
					return prevState;
				}

				// Find the multiSelectGroup or create a bounding box for the selected diagrams
				const multiSelectGroup = prevState.multiSelectGroup;
				if (!multiSelectGroup) {
					// If multiSelectGroup is not available, we cannot determine the bounding box
					console.error("Cannot group without multiSelectGroup information.");
					return prevState;
				}

				// Create a new group data.
				const groupId = e.groupId ?? newId();
				const group: GroupState = {
					...multiSelectGroup,
					id: groupId,
					type: "Group",
					isSelected: true,
					isRootSelected: true,
					showOutline: true,
					items: applyFunctionRecursively(targetDiagrams, (childItem) => {
						if (!isSelectableState(childItem)) {
							return childItem;
						}
						return {
							...childItem,
							isSelected: false,
							isAncestorSelected: true,
							showOutline: true,
						};
					}),
				};

				// Find parent canvas that contains all target diagrams
				let parentCanvas = findParentCanvasContainingAllDiagrams(
					prevState.items,
					targetDiagrams,
				);
				// If found, remove target diagrams from it
				if (parentCanvas) {
					parentCanvas = removeItemsFromDiagram(parentCanvas, e.diagramIds);
				}

				// Remove target diagrams from the current items
				const targetRemovedItems = removeDiagramsById(
					prevState.items,
					e.diagramIds,
				);

				// Add group to parent canvas or root level
				const mergedItems = addDiagramToParentOrRoot(
					targetRemovedItems,
					group,
					parentCanvas,
				);

				// Clean up groups (remove empty groups, flatten single-item groups)
				const groupsCleanedUpItems = cleanupGroups(mergedItems);

				// Bring connect lines forward that are connected to grouped components.
				const orderedItems = bringConnectLinesForward(
					groupsCleanedUpItems,
					targetDiagrams,
				);

				const outlineUpdatedItems = updateOutlineOfAllItemables(orderedItems);

				// Create next state
				const eventId = e.eventId ?? newEventId();
				let nextState = {
					...prevState,
					items: outlineUpdatedItems,
					multiSelectGroup: undefined,
				} as SvgCanvasState;

				// Add history
				nextState = addHistory(eventId, nextState);

				return nextState;
			});
		};

		eventBus.addEventListener(GROUP_EVENT_NAME, handleEvent);

		return () => {
			eventBus.removeEventListener(GROUP_EVENT_NAME, handleEvent);
		};
	}, []);
};
