import { useEffect, useRef } from "react";

import { APPEND_DIAGRAMS_EVENT_NAME } from "../../../constants/core/EventNames";
import type { AppendDiagramsEvent } from "../../../types/events/AppendDiagramsEvent";
import { getDiagramById } from "../../../utils/core/getDiagramById";
import { degreesToRadians } from "../../../utils/math/common/degreesToRadians";
import { affineTransformation } from "../../../utils/math/transform/affineTransformation";
import { isFrame } from "../../../utils/validation/isFrame";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";
import { adjustTargetDiagramSize } from "../../utils/adjustTargetDiagramSize";
import { appendDiagrams } from "../../utils/appendDiagrams";
import { cleanupGroups } from "../../utils/cleanupGroups";
import { removeDiagramsById } from "../../utils/removeDiagramsById";
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

				// 2. Transform diagram coordinates from relative to absolute
				const transformedDiagrams = event.diagrams.map((diagram) => {
					// Get target diagram center position
					const { x: targetCenterX, y: targetCenterY } = targetDiagram;

					// Check if target diagram has transformation properties
					if (isFrame(targetDiagram)) {
						const { width, height, rotation = 0, scaleX = 1, scaleY = 1 } = targetDiagram;

						// Convert rotation to radians
						const rotationRadians = degreesToRadians(rotation);

						// For relative coordinates within the frame, we need to:
						// 1. Treat the relative coordinates as offsets from the frame's top-left corner
						// 2. Convert these to offsets from the frame's center
						// 3. Apply the frame's transformation (scale, rotation)
						// 4. Add the frame's center position

						// Convert relative coordinates to offsets from center
						// Assuming relative coordinates are from top-left of the frame
						const offsetFromCenterX = diagram.x - (width / 2);
						const offsetFromCenterY = diagram.y - (height / 2);

						// Apply affine transformation to convert frame-relative coordinates to absolute
						const transformedPosition = affineTransformation(
							offsetFromCenterX, // offset from frame center x
							offsetFromCenterY, // offset from frame center y
							scaleX,           // target frame's x scale
							scaleY,           // target frame's y scale
							rotationRadians,  // target frame's rotation
							targetCenterX,    // target frame's center x position
							targetCenterY     // target frame's center y position
						);

						// Return diagram with transformed coordinates
						return {
							...diagram,
							x: transformedPosition.x,
							y: transformedPosition.y,
						};
					} else {
						// For non-frame targets, just add target center position as offset
						// This assumes the relative coordinates are offsets from the target center
						return {
							...diagram,
							x: diagram.x + targetCenterX,
							y: diagram.y + targetCenterY,
						};
					}
				});

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
				const targetDiagramSizeAdjustedItems = adjustTargetDiagramSize(
					diagramsAppendedItems,
					event.targetId,
					targetDiagram,
				);

				// 6. Clean up empty groups
				const groupsCleanedUpItems = cleanupGroups(
					targetDiagramSizeAdjustedItems,
				);

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
