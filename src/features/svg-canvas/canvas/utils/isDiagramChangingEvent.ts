import type { EventType } from "../../types/events/EventType";

/**
 * Check if the event type is a diagram changing event.
 *
 * @param eventType - The type of the event to check.
 * @returns	{boolean} - True if the event type is a diagram changing event, false otherwise.
 */
export const isDiagramChangingEvent = (eventType: EventType): boolean => {
	return eventType !== "End" && eventType !== "Instant";
};
