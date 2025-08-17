import { SelectableDefaultState } from "../core/SelectableDefaultState";
import { TransformativeDefaultState } from "../core/TransformativeDefaultState";
import { SvgDefaultData } from "../../data/shapes/SvgDefaultData";
import type { SvgState } from "../../../types/state/shapes/SvgState";

export const SvgDefaultState = {
	...SvgDefaultData,
	...SelectableDefaultState,
	...TransformativeDefaultState,
} as const satisfies SvgState;;