import type { Diagram } from "../data/catalog/Diagram"; // TODO: type以外のモジュールを参照している

/**
 * Event for creating a new diagram item with complete details
 */
export type NewItemEvent = {
	eventId: string;
	item: Diagram;
};
