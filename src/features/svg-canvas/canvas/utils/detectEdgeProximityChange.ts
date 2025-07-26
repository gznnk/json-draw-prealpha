import type { EdgeProximityResult } from "./detectEdgeProximity";

/**
 * Object representing scroll direction derived from edge proximity
 */
export type ScrollDirection = {
  horizontal: "left" | "right" | null;
  vertical: "top" | "bottom" | null;
};

/**
 * Detects if the edge proximity has changed compared to the previous state.
 *
 * @param previous - Previous scroll direction
 * @param current - Current edge proximity result
 * @returns True if proximity changed, otherwise false
 */
export const detectEdgeProximityChange = (
  previous: ScrollDirection,
  current: EdgeProximityResult,
): boolean =>
  previous.horizontal !== current.horizontal ||
  previous.vertical !== current.vertical;
