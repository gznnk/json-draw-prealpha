// Import React.
import { useEffect, useRef } from "react";

// Import constants.
import { ADD_NEW_DIAGRAM_EVENT_NAME } from "../../../constants/core/EventNames";

// Import types.
import type { AddDiagramEvent } from "../../../types/events/AddDiagramEvent";
import type { SvgCanvasState } from "../../types/SvgCanvasState";
import type { SvgCanvasSubHooksProps } from "../../types/SvgCanvasSubHooksProps";

// Import utils.
import { isSelectableState } from "../../../utils/validation/isSelectableState";

// Import hooks.
import { useAddHistory } from "../history/useAddHistory";

/**
 * Custom hook to handle new diagram events on the canvas.
 */
export const useOnAddDiagram = (props: SvgCanvasSubHooksProps) => {
	// Get the data change handler.
	const onDataChange = useAddHistory(props);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
		onDataChange,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	useEffect(() => {
		// Bypass references to avoid function creation in every render.
		const { eventBus } = refBus.current.props;

		// Listener for new diagram events.
		const newDiagramListener = (e: Event) => {
			// Bypass references to avoid function creation in every render.
			const { setCanvasState } = refBus.current.props;
			const { onDataChange } = refBus.current;

			const event = (e as CustomEvent<AddDiagramEvent>).detail;

			// Call the function to add a new item to the canvas.
			setCanvasState((prevState) => {
				const newState = {
					...prevState,
					items: [
						...prevState.items.map((i) => {
							if (isSelectableState(i) && isSelectableState(event.item)) {
								return {
									...i,
									// If the new item is selected, unselect other items.
									isSelected: event.item.isSelected ? false : i.isSelected,
								};
							}
							return i;
						}),
						{
							...event.item,
						},
					],
				} as SvgCanvasState;

				// Notify the data change.
				onDataChange(event.eventId, newState);

				return newState;
			});
		};

		// Add the event listener for new diagram events.
		eventBus.addEventListener(ADD_NEW_DIAGRAM_EVENT_NAME, newDiagramListener);

		// Cleanup the event listener on component unmount.
		return () => {
			eventBus.removeEventListener(
				ADD_NEW_DIAGRAM_EVENT_NAME,
				newDiagramListener,
			);
		};
	}, []);
};
