// Import types.
import type { DiagramType } from "../../../types/core/DiagramType";
import type { DiagramFeatures } from "../../../types/core/DiagramFeatures";

// Import constants.
import { DiagramBaseDefaultState } from "../core/DiagramBaseDefaultState";
import { SelectableDefaultState } from "../core/SelectableDefaultState";
import { TransformativeDefaultState } from "../core/TransformativeDefaultState";
import { ItemableDefaultState } from "../core/ItemableDefaultState";
import { ConnectableDefaultState } from "./ConnectableDefaultState";
import { StrokableDefaultState } from "../core/StrokableDefaultState";
import { FillableDefaultState } from "../core/FillableDefaultState";
import { TextableDefaultState } from "../core/TextableDefaultState";

/**
 * Creates default state for a shape by combining feature-specific defaults.
 * Uses conditional types to include only the required defaults based on features.
 *
 * @param config - Configuration for the shape
 * @returns Default state object for the shape
 */
export function CreateDefaultState<T>(config: {
	type: DiagramType;
	options: DiagramFeatures;
	baseData: Record<string, unknown>;
	properties?: Record<string, unknown>;
}): T {
	const { type, options, baseData, properties } = config;

	// Build default state by combining base data and state with feature-specific defaults
	const result = {
		...baseData,
		...DiagramBaseDefaultState,
		...(options.selectable ? SelectableDefaultState : {}),
		...(options.transformative ? TransformativeDefaultState : {}),
		...(options.itemable ? ItemableDefaultState : {}),
		...(options.connectable ? ConnectableDefaultState : {}),
		...(options.strokable ? StrokableDefaultState : {}),
		...(options.fillable ? FillableDefaultState : {}),
		...(options.textable ? TextableDefaultState : {}),
		...(properties ? properties : {}),
		type,
	} as const;

	return result as T;
}
