import { SelectableDefaultState } from "../core/SelectableDefaultState";
import { TransformativeDefaultState } from "../core/TransformativeDefaultState";
import { TextableDefaultState } from "../core/TextableDefaultState";
import { ConnectableDefaultState } from "./ConnectableDefaultState";
import { EllipseDefaultData } from "../../data/shapes/EllipseDefaultData";
import type { EllipseState } from "../../../types/state/shapes/EllipseState";

export const EllipseDefaultState = {
	...EllipseDefaultData,
	...SelectableDefaultState,
	...TransformativeDefaultState,
	...TextableDefaultState,
	...ConnectableDefaultState,
} as const satisfies EllipseState;
