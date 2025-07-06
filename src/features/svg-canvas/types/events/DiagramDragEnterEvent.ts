/**
 * Event fired when a dragged element enters a diagram element.
 * Used to track drag enter state for visual feedback during drag operations.
 */
export type DiagramDragEnterEvent = {
	eventId: string;
	id: string;
	targetId: string;
	x: number;
	y: number;
};
