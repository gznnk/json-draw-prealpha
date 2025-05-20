import type { EventType } from "../../types/events/EventType";

/**
 * Check if the event type is a history event.
 *
 * @param eventType - The type of the event to check.
 * @returns {boolean} - True if the event type is a history event, false otherwise.
 */
export const isHistoryEvent = (eventType: EventType): boolean => {
	return eventType === "End" || eventType === "Instant";
};
