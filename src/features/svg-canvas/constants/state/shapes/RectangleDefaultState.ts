import { SelectableDefaultState } from "../core/SelectableDefaultState";
import { TransformativeDefaultState } from "../core/TransformativeDefaultState";
import { TextableDefaultState } from "../core/TextableDefaultState";
import { ConnectableDefaultState } from "./ConnectableDefaultState";
import { RectangleDefaultData } from "../../data/shapes/RectangleDefaultData";
import type { RectangleState } from "../../../types/state/shapes/RectangleState";

export const RectangleDefaultState = {
	...RectangleDefaultData,
	...SelectableDefaultState,
	...TransformativeDefaultState,
	...TextableDefaultState,
	...ConnectableDefaultState,
} as const satisfies RectangleState;
