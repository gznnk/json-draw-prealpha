import { SelectableDefaultState } from "../core/SelectableDefaultState";
import { ConnectPointDefaultData } from "../../data/shapes/ConnectPointDefaultData";
import type { ConnectPointState } from "../../../types/state/shapes/ConnectPointState";

export const ConnectPointDefaultState = {
	...ConnectPointDefaultData,
	...SelectableDefaultState,
} as const satisfies ConnectPointState;
