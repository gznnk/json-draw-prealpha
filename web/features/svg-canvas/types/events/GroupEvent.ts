/**
 * Event for grouping diagrams
 */
export type GroupEvent = {
	eventId?: string;
	groupId?: string;
	diagramIds: string[];
};
