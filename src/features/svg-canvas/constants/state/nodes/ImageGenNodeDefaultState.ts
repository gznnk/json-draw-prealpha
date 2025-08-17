import { SelectableDefaultState } from "../core/SelectableDefaultState";
import { StrokableDefaultState } from "../core/StrokableDefaultState";
import { FillableDefaultState } from "../core/FillableDefaultState";
import { TextableDefaultState } from "../core/TextableDefaultState";
import { TransformativeDefaultState } from "../core/TransformativeDefaultState";
import { ConnectableDefaultState } from "../shapes/ConnectableDefaultState";
import { ImageGenNodeDefaultData } from "../../data/nodes/ImageGenNodeDefaultData";
import type { ImageGenNodeState } from "../../../types/state/nodes/ImageGenNodeState";

export const ImageGenNodeDefaultState = {
	...ImageGenNodeDefaultData,
	...SelectableDefaultState,
	...StrokableDefaultState,
	...FillableDefaultState,
	...TextableDefaultState,
	...TransformativeDefaultState,
	...ConnectableDefaultState,
} as const satisfies ImageGenNodeState;
