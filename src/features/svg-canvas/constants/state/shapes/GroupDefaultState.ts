import { SelectableDefaultState } from "../core/SelectableDefaultState";
import { TransformativeDefaultState } from "../core/TransformativeDefaultState";
import { GroupDefaultData } from "../../data/shapes/GroupDefaultData";
import type { GroupState } from "../../../types/state/shapes/GroupState";

export const GroupDefaultState = {
	...GroupDefaultData,
	...SelectableDefaultState,
	...TransformativeDefaultState,
} as const satisfies GroupState;;