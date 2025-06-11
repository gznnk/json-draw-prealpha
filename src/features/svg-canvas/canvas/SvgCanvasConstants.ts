/**
 * Max history size for the history stack.
 */
export const MAX_HISTORY_SIZE = 20;

/**
 * The amount of space to expand the canvas when calculating optimal canvas size.
 */
export const CANVAS_EXPANSION_SIZE = 10;

/**
 * The threshold from the edge of the canvas to trigger auto-expansion.
 * Smaller value means closer to the edge to trigger expansion.
 */
export const AUTO_SCROLL_THRESHOLD = 20;

/**
 * The amount of space to scroll each time when auto-scrolling at canvas edge.
 */
export const AUTO_SCROLL_STEP_SIZE = 10;

/**
 * Interval duration for continuous auto-scrolling when cursor is at edge (in milliseconds).
 */
export const AUTO_SCROLL_INTERVAL_MS = 25;

/**
 * Id of the group for multi-select elements.
 */
export const MULTI_SELECT_GROUP = "MultiSelectGroup";
