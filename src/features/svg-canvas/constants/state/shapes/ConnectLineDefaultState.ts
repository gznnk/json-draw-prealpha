import { SelectableDefaultState } from "../core/SelectableDefaultState";
import { TransformativeDefaultState } from "../core/TransformativeDefaultState";
import { ConnectLineDefaultData } from "../../data/shapes/ConnectLineDefaultData";
import type { ConnectLineState } from "../../../types/state/shapes/ConnectLineState";

export const ConnectLineDefaultState = {
	...ConnectLineDefaultData,
	...SelectableDefaultState,
	...TransformativeDefaultState,
} as const satisfies ConnectLineState;;