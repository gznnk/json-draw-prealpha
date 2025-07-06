/**
 * Event fired when a dragged element leaves a diagram element.
 * Used to track drag leave state for visual feedback during drag operations.
 */
export type DiagramDragLeaveEvent = {
	eventId: string;
	id: string;
	targetId: string;
	x: number;
	y: number;
};
