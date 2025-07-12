/**
 * Max history size for the history stack.
 */
export const MAX_HISTORY_SIZE = 20;

/**
 * The grid size used for canvas bounds calculations and expansion.
 */
export const CANVAS_GRID_SIZE = 100;

/**
 * The threshold from the edge of the canvas to trigger auto-expansion.
 * Smaller value means closer to the edge to trigger expansion.
 */
export const AUTO_SCROLL_THRESHOLD = 20;

/**
 * The amount of space to scroll each time when auto-scrolling at canvas edge.
 */
export const AUTO_SCROLL_STEP_SIZE = 15;

/**
 * Interval duration for continuous auto-scrolling when cursor is at edge (in milliseconds).
 */
export const AUTO_SCROLL_INTERVAL_MS = 20;

/**
 * Id of the group for multi-select elements.
 */
export const MULTI_SELECT_GROUP = "MultiSelectGroup";

/**
 * Minimum zoom level for the canvas.
 */
export const MIN_ZOOM_LEVEL = 0.1;

/**
 * Maximum zoom level for the canvas.
 */
export const MAX_ZOOM_LEVEL = 3.0;
