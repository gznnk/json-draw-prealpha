import type { DiagramFeatures } from "../../../types/core/DiagramFeatures";
import { DiagramBaseDefaultData } from "../core/DiagramBaseDefaultData";
import { TransformativeDefaultData } from "../core/TransformativeDefaultData";
import { ConnectableDefaultData } from "./ConnectableDefaultData";
import { StrokableDefaultData } from "../core/StrokableDefaultData";
import { FillableDefaultData } from "../core/FillableDefaultData";
import { TextableDefaultData } from "../core/TextableDefaultData";

/**
 * Configuration for creating shape default data.
 */
export type DefaultDataConfig<P extends Record<string, unknown>> = {
  /** Shape type name (e.g., "Rectangle", "Circle") */
  type: string;
  /** Feature options for the shape */
  options: DiagramFeatures;
  /** Additional properties specific to this shape */
  properties: P;
};

/**
 * Creates default data for a shape by combining feature-specific defaults.
 * This helper function simplifies the process of defining new shape default data
 * by automatically combining the appropriate default data objects based on the feature options.
 * 
 * @param config - Configuration for the shape
 * @returns Default data object for the shape
 * 
 * @example
 * ```typescript
 * export const CircleDefaultData = CreateDefaultData({
 *   type: "Circle",
 *   options: {
 *     transformative: true,
 *     connectable: true,
 *     strokable: true,
 *     fillable: true,
 *   },
 *   properties: {
 *     radius: 50,
 *   },
 * });
 * ```
 */
export const CreateDefaultData = <P extends Record<string, unknown>>(
  config: DefaultDataConfig<P>
) => {
  const { type, options, properties } = config;

  // Build default data by combining base data with feature-specific defaults
  let defaultData: Record<string, unknown> = {
    ...DiagramBaseDefaultData,
  };

  if (options.transformative) {
    defaultData = { ...defaultData, ...TransformativeDefaultData };
  }

  if (options.connectable) {
    defaultData = { ...defaultData, ...ConnectableDefaultData };
  }

  if (options.strokable) {
    defaultData = { ...defaultData, ...StrokableDefaultData };
  }

  if (options.fillable) {
    defaultData = { ...defaultData, ...FillableDefaultData };
  }

  if (options.textable) {
    defaultData = { ...defaultData, ...TextableDefaultData };
  }

  // Add shape-specific properties and type
  return {
    ...defaultData,
    ...properties,
    type,
  } as const;
};