/**
 * Enum for the interaction state of the SvgCanvas.
 * Represents whether the canvas is in normal state, dragging, or transforming.
 */
export enum InteractionState {
	/** Normal state - no special interaction */
	Normal = "normal",
	/** Dragging state - user is dragging elements */
	Dragging = "dragging",
	/** Transforming state - user is transforming elements (resize, rotate, etc.) */
	Transforming = "transforming",
}
