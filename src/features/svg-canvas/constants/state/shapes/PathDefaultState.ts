import { SelectableDefaultState } from "../core/SelectableDefaultState";
import { TransformativeDefaultState } from "../core/TransformativeDefaultState";
import { PathDefaultData } from "../../data/shapes/PathDefaultData";
import type { PathState } from "../../../types/state/shapes/PathState";

export const PathDefaultState = {
	...PathDefaultData,
	...SelectableDefaultState,
	...TransformativeDefaultState,
} as const satisfies PathState;;