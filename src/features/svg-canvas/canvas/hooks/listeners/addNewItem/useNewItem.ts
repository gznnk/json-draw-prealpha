// Import React.
import { useEffect, useRef } from "react";

// Import types related to SvgCanvas.
import type { NewItemEvent } from "../../../../types/events/NewItemEvent";
import type { CanvasHooksProps, SvgCanvasState } from "../../../SvgCanvasTypes";

// Import functions related to SvgCanvas.
import { isSelectableData } from "../../../../utils/validation/isSelectableData";
import { addHistory } from "../../../utils/addHistory";
import { svgCanvasStateToData } from "../../../utils/svgCanvasStateToData";

// Import related to this component.
import { ADD_NEW_ITEM_EVENT_NAME } from "./addNewItemConstants";

/**
 * Custom hook to handle new item events on the canvas.
 */
export const useNewItem = (props: CanvasHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;
	useEffect(() => {
		const newItemListener = (e: Event) => {
			const event = (e as CustomEvent<NewItemEvent>).detail;

			// Bypass references to avoid function creation in every render.
			const { setCanvasState, onDataChange } = refBus.current.props;

			// Call the function to add a new item to the canvas.
			setCanvasState((prevState) => {
				let newState = {
					...prevState,
					items: [
						...prevState.items.map((i) => {
							if (isSelectableData(i) && isSelectableData(event.item)) {
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

				// Add a new history entry.
				newState.lastHistoryEventId = event.eventId;
				newState = addHistory(prevState, newState);

				// Notify the data change.
				onDataChange?.(svgCanvasStateToData(newState));

				return newState;
			});
		};

		// Add the event listener for new item events.
		window.addEventListener(ADD_NEW_ITEM_EVENT_NAME, newItemListener);

		// Cleanup the event listener on component unmount.
		return () => {
			window.removeEventListener(ADD_NEW_ITEM_EVENT_NAME, newItemListener);
		};
	}, []);
};
