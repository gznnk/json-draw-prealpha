/**
 * Defines the drag behavior type for Path components.
 * - "whole": Allows dragging the entire path shape
 * - "segment": Allows dragging individual line segments
 * - "segment-right-angle": Allows dragging segments with right-angle constraint
 * - "none": Disables all dragging
 */
export type PathDragType = "whole" | "segment" | "segment-right-angle" | "none";
