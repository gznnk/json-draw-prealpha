/**
 * Type for grab scroll state in the SVG canvas.
 * Manages the state of grab scrolling functionality including whether
 * grab scrolling is currently active and if any grab scroll events occurred.
 */
export type GrabScrollState = {
	/** Whether grab scrolling is currently active */
	isGrabScrolling: boolean;
	/** Whether any grab scroll action has occurred during the current session */
	grabScrollOccurred: boolean;
};
