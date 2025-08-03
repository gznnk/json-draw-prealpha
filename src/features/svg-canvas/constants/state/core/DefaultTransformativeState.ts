import { TransformativeDefaultData } from "../../data/core/TransformativeDefaultData";
import type { TransformativeState } from "../../../types/state/core/TransformativeState";

export const DefaultTransformativeState = {
	...TransformativeDefaultData,
	keepProportion: false,
	showTransformControls: false,
	isTransforming: false,
} as const satisfies TransformativeState;