/**
 * Event fired when a diagram is clicked
 */
export type DiagramClickEvent = {
	eventId: string;
	id: string;
	isAncestorSelected: boolean;
};
