// Import types.
import type { DiagramFeatures } from "../../../types/core/DiagramFeatures";
import type { DiagramType } from "../../../types/core/DiagramType";

// Import constants.
import { DiagramBaseDefaultData } from "../core/DiagramBaseDefaultData";
import { FillableDefaultData } from "../core/FillableDefaultData";
import { ItemableDefaultData } from "../core/ItemableDefaultData";
import { StrokableDefaultData } from "../core/StrokableDefaultData";
import { TextableDefaultData } from "../core/TextableDefaultData";
import { TransformativeDefaultData } from "../core/TransformativeDefaultData";
import { ConnectableDefaultData } from "./ConnectableDefaultData";

/**
 * Creates default data for a shape by combining feature-specific defaults.
 * Uses conditional types to include only the required defaults based on features.
 *
 * @param config - Configuration for the shape
 * @returns Default data object for the shape
 */
export function CreateDefaultData<T>(config: {
	type: DiagramType;
	options: DiagramFeatures;
	properties?: Record<string, unknown>;
}): T {
	const { type, options, properties } = config;

	// Build default data by combining base data with feature-specific defaults
	const result = {
		...DiagramBaseDefaultData,
		...(options.transformative ? TransformativeDefaultData : {}),
		...(options.itemable ? ItemableDefaultData : {}),
		...(options.connectable ? ConnectableDefaultData : {}),
		...(options.strokable ? StrokableDefaultData : {}),
		...(options.fillable ? FillableDefaultData : {}),
		...(options.textable ? TextableDefaultData : {}),
		...(properties ? properties : {}),
		type,
	} as const;

	return result as T;
}
