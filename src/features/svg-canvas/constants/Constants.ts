/**
 * Constants used throughout the SVG Canvas feature
 */

/** Drag dead zone in pixels */
export const DRAG_DEAD_ZONE = 5;

/** Margin between shapes and connection lines */
export const CONNECT_LINE_MARGIN = 20;

/** MiniMap viewport constraint margin in canvas units */
export const MINIMAP_VIEWPORT_MARGIN = 20000;

/** The threshold from the edge of the canvas to trigger auto-expansion */
export const AUTO_SCROLL_THRESHOLD = 20;

/** The amount of space to scroll each time when auto-scrolling at canvas edge */
export const AUTO_SCROLL_STEP_SIZE = 15;

/** Interval duration for continuous auto-scrolling when cursor is at edge (in milliseconds) */
export const AUTO_SCROLL_INTERVAL_MS = 20;
