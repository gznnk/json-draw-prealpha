import type { Diagram } from "../../catalog/DiagramTypes";

/**
 * Event for creating a new diagram item with complete details
 */
export type NewItemEvent = {
	eventId: string;
	item: Diagram;
};
