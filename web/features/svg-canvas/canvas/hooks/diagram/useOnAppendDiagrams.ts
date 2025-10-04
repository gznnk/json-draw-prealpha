import { useEffect, useRef } from "react";

import { APPEND_DIAGRAMS_EVENT_NAME } from "../../../constants/core/EventNames";
import type { AppendDiagramsEvent } from "../../../types/events/AppendDiagramsEvent";
import { getDiagramById } from "../../../utils/core/getDiagramById";
import { transformRelativeToAbsoluteCoordinates } from "../../../utils/math/transform/transformRelativeToAbsoluteCoordinates";
import { refreshConnectLines } from "../../../utils/shapes/connectLine/refreshConnectLines";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";
import { adjustTargetDiagramSize } from "../../utils/adjustTargetDiagramSize";
import { appendDiagrams } from "../../utils/appendDiagrams";
import { cleanupGroups } from "../../utils/cleanupGroups";
import { removeDiagramsById } from "../../utils/removeDiagramsById";
import { replaceDiagram } from "../../utils/replaceDiagram";
import { updateDiagramConnectPoints } from "../../utils/updateDiagramConnectPoints";
import { updateOutlineOfAllItemables } from "../../utils/updateOutlineOfAllItemables";
import { useAddHistory } from "../history/useAddHistory";

/**
 * Custom hook to handle AppendDiagramsEvent on the canvas.
 * Listens for the event and updates the canvas state accordingly.
 */
export const useOnAppendDiagrams = (props: SvgCanvasSubHooksProps) => {
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

		// Listener for AppendDiagramsEvent
		const appendDiagramsListener = (e: Event) => {
			// Bypass references to avoid function creation in every render
			const {
				props: { setCanvasState },
				addHistory,
			} = refBus.current;

			const event = (e as CustomEvent<AppendDiagramsEvent>).detail;

			// Update the canvas state
			setCanvasState((prevState) => {
				// 1. Get target diagram
				const targetDiagram = getDiagramById(prevState.items, event.targetId);
				if (!targetDiagram) {
					console.warn(`Target diagram with id ${event.targetId} not found`);
					return prevState;
				}

				// Extract IDs of diagrams to move
				const diagramIds = event.diagrams.map((diagram) => diagram.id);

				// 2. Transform diagram coordinates from relative to absolute if needed
				const transformedDiagrams =
					event.useAbsoluteCoordinates !== false
						? transformRelativeToAbsoluteCoordinates(
								event.diagrams,
								targetDiagram,
							)
						: event.diagrams;

				// 3. Remove source diagrams from their current locations
				const diagramsRemovedItems = removeDiagramsById(
					prevState.items,
					diagramIds,
				);

				// 4. Append diagrams to target diagram with transformed coordinates
				const diagramsAppendedItems = appendDiagrams(
					diagramsRemovedItems,
					event.targetId,
					transformedDiagrams,
				);

				// 5. Adjust target diagram size if appended diagrams extend beyond bounds
				const targetAfterAppend = getDiagramById(
					diagramsAppendedItems,
					event.targetId,
				);
				if (!targetAfterAppend) {
					console.error(
						`Target diagram with id ${event.targetId} not found after append`,
					);
					return prevState;
				}

				// 5-1. Adjust target diagram size
				const targetAfterResize = adjustTargetDiagramSize(targetAfterAppend);

				// 6. Update connect points for the resized target diagram
				const adjustedAndUpdatedTarget =
					updateDiagramConnectPoints(targetAfterResize);
				const connectPointsUpdatedItems = replaceDiagram(
					diagramsAppendedItems,
					adjustedAndUpdatedTarget,
				);

				// 7. Clean up empty groups
				const groupsCleanedUpItems = cleanupGroups(connectPointsUpdatedItems);

				// Update outlines
				const updatedItems = updateOutlineOfAllItemables(groupsCleanedUpItems);

				// Create new state with updated items
				let newState = {
					...prevState,
					items: updatedItems,
				};

				// 8. Refresh connect lines if target diagram was resized
				newState = refreshConnectLines(
					[adjustedAndUpdatedTarget],
					newState,
					prevState,
				);

				// Add history
				newState = addHistory(event.eventId, newState);

				return newState;
			});
		};

		// Add the event listener
		eventBus.addEventListener(
			APPEND_DIAGRAMS_EVENT_NAME,
			appendDiagramsListener,
		);

		// Cleanup the event listener on component unmount
		return () => {
			eventBus.removeEventListener(
				APPEND_DIAGRAMS_EVENT_NAME,
				appendDiagramsListener,
			);
		};
	}, []);
};
