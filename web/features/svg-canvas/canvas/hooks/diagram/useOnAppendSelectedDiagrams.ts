import { useEffect, useRef } from "react";

import { APPEND_SELECTED_DIAGRAMS_EVENT_NAME } from "../../../constants/core/EventNames";
import type { AppendSelectedDiagramsEvent } from "../../../types/events/AppendSelectedDiagramsEvent";
import { getDiagramById } from "../../../utils/core/getDiagramById";
import { getSelectedDiagrams } from "../../../utils/core/getSelectedDiagrams";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";
import { adjustTargetDiagramSize } from "../../utils/adjustTargetDiagramSize";
import { appendDiagrams } from "../../utils/appendDiagrams";
import { cleanupGroups } from "../../utils/cleanupGroups";
import { removeDiagramsById } from "../../utils/removeDiagramsById";
import { updateOutlineOfAllItemables } from "../../utils/updateOutlineOfAllItemables";
import { useAddHistory } from "../history/useAddHistory";

/**
 * Custom hook to handle AppendSelectedDiagramsEvent on the canvas.
 * Listens for the event, retrieves currently selected diagrams, and updates the canvas state accordingly.
 */
export const useOnAppendSelectedDiagrams = (props: SvgCanvasSubHooksProps) => {
	// Get the data change handler
	const addHistory = useAddHistory(props);

	// Create references bypass to avoid function creation in every render
	const refBusVal = {
		props,
		addHistory,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	useEffect(() => {
		// Bypass references to avoid function creation in every render
		const { eventBus } = refBus.current.props;

		// Listener for AppendSelectedDiagramsEvent
		const appendSelectedDiagramsListener = (e: Event) => {
			// Bypass references to avoid function creation in every render
			const {
				props: { setCanvasState },
				addHistory,
			} = refBus.current;

			const event = (e as CustomEvent<AppendSelectedDiagramsEvent>).detail;

			// Update the canvas state
			setCanvasState((prevState) => {
				// 1. Get target frame
				const targetFrame = getDiagramById(prevState.items, event.targetId);
				if (!targetFrame) {
					console.warn(`Target frame with id ${event.targetId} not found`);
					return prevState;
				}

				// 2. Get currently selected diagrams
				const selectedDiagrams = getSelectedDiagrams(prevState.items);
				if (selectedDiagrams.length === 0) {
					console.warn("No diagrams are currently selected");
					return prevState;
				}

				// Extract IDs of diagrams to move
				const diagramIds = selectedDiagrams.map(diagram => diagram.id);

				// 3. Remove source diagrams from their current locations
				const diagramsRemovedItems = removeDiagramsById(prevState.items, diagramIds);

				// 4. Append diagrams to target frame
				const diagramsAppendedItems = appendDiagrams(diagramsRemovedItems, event.targetId, selectedDiagrams);

				// 5. Adjust target diagram size if appended diagrams extend beyond bounds
				const targetDiagramSizeAdjustedItems = adjustTargetDiagramSize(
					diagramsAppendedItems,
					targetFrame,
				);

				// 6. Clean up empty groups
				const groupsCleanedUpItems = cleanupGroups(targetDiagramSizeAdjustedItems);

				// Update outlines
				const updatedItems = updateOutlineOfAllItemables(groupsCleanedUpItems);

				// Create new state with updated items
				let newState = {
					...prevState,
					items: updatedItems,
				};

				// Add history
				newState = addHistory(event.eventId, newState);

				return newState;
			});
		};

		// Add the event listener
		eventBus.addEventListener(APPEND_SELECTED_DIAGRAMS_EVENT_NAME, appendSelectedDiagramsListener);

		// Cleanup the event listener on component unmount
		return () => {
			eventBus.removeEventListener(
				APPEND_SELECTED_DIAGRAMS_EVENT_NAME,
				appendSelectedDiagramsListener,
			);
		};
	}, []);
};