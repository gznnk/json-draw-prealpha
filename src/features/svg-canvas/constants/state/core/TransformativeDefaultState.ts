import { TransformativeDefaultData } from "../../data/core/TransformativeDefaultData";
import type { TransformativeState } from "../../../types/state/core/TransformativeState";

export const TransformativeDefaultState = {
	...TransformativeDefaultData,
	showTransformControls: false,
	isTransforming: false,
} as const satisfies TransformativeState;
