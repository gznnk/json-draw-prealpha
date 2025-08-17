/**
 * Unified diagram features configuration.
 * Controls which feature interfaces should be included in the resulting types.
 * Used across data, state, and props type creation.
 */
export type DiagramFeatures = {
  /** Basic selection capability */
  selectable?: boolean;
  /** Position, size, and rotation transformation */
  transformative?: boolean;
  /** Container for other diagram items */
  itemable?: boolean;
  /** Connection points and lines */
  connectable?: boolean;
  /** Stroke/border styling */
  strokable?: boolean;
  /** Fill/background styling */
  fillable?: boolean;
  /** Text content and styling */
  textable?: boolean;
  /** Executable/clickable functionality */
  executable?: boolean;
  /** Can create new items */
  itemCreatable?: boolean;
  /** File drop handling */
  fileDroppable?: boolean;
};