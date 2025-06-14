// Import types related to SvgCanvas.
import type { NewItemEvent } from "../../../../types/events/NewItemEvent";

// Import related to this component.
import { ADD_NEW_ITEM_EVENT_NAME } from "./addNewItemConstants";

/**
 * Function to trigger a new item event on the canvas.
 * @param e - The new item event to be triggered.
 */
export const dispatchNewItemEvent = (e: NewItemEvent) => {
	// Create a new event with the specified name and detail.
	const event = new CustomEvent(ADD_NEW_ITEM_EVENT_NAME, {
		detail: e,
	});
	// Dispatch the event on the window object.
	window.dispatchEvent(event);
};
