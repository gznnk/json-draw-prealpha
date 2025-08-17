import type { DiagramFeatures } from "../../../types/core/DiagramFeatures";
import { DiagramBaseDefaultState } from "../core/DiagramBaseDefaultState";
import { SelectableDefaultState } from "../core/SelectableDefaultState";
import { TransformativeDefaultState } from "../core/TransformativeDefaultState";
import { ItemableDefaultState } from "../core/ItemableDefaultState";
import { ConnectableDefaultState } from "./ConnectableDefaultState";
import { StrokableDefaultState } from "../core/StrokableDefaultState";
import { FillableDefaultState } from "../core/FillableDefaultState";
import { TextableDefaultState } from "../core/TextableDefaultState";

/**
 * Configuration for creating shape default state.
 */
export type DefaultStateConfig<P extends Record<string, unknown>> = {
  /** Shape type name (e.g., "Rectangle", "Circle") */
  type: string;
  /** Feature options for the shape */
  options: DiagramFeatures;
  /** Additional properties specific to this shape */
  properties: P;
  /** Base data properties to include in state */
  baseData: Record<string, unknown>;
};

/**
 * Creates default state for a shape by combining feature-specific defaults.
 * This helper function simplifies the process of defining new shape default state
 * by automatically combining the appropriate default state objects based on the feature options.
 * 
 * @param config - Configuration for the shape state
 * @returns Default state object for the shape
 * 
 * @example
 * ```typescript
 * export const CircleDefaultState = CreateDefaultState({
 *   type: "Circle",
 *   options: {
 *     selectable: true,
 *     transformative: true,
 *     connectable: true,
 *     strokable: true,
 *     fillable: true,
 *   },
 *   properties: {
 *     radius: 50,
 *   },
 *   baseData: CircleDefaultData,
 * });
 * ```
 */
export const CreateDefaultState = <P extends Record<string, unknown>>(
  config: DefaultStateConfig<P>
) => {
  const { type, options, properties, baseData } = config;

  // Start with base data and base state
  let defaultState: Record<string, unknown> = {
    ...baseData,
    ...DiagramBaseDefaultState,
  };

  if (options.selectable) {
    defaultState = { ...defaultState, ...SelectableDefaultState };
  }

  if (options.transformative) {
    defaultState = { ...defaultState, ...TransformativeDefaultState };
  }

  if (options.itemable) {
    defaultState = { ...defaultState, ...ItemableDefaultState };
  }

  if (options.connectable) {
    defaultState = { ...defaultState, ...ConnectableDefaultState };
  }

  if (options.strokable) {
    defaultState = { ...defaultState, ...StrokableDefaultState };
  }

  if (options.fillable) {
    defaultState = { ...defaultState, ...FillableDefaultState };
  }

  if (options.textable) {
    defaultState = { ...defaultState, ...TextableDefaultState };
  }

  // Add shape-specific properties (override if needed)
  return {
    ...defaultState,
    ...properties,
    type,
  } as const;
};