import { SelectableDefaultState } from "../core/SelectableDefaultState";
import { TransformativeDefaultState } from "../core/TransformativeDefaultState";
import { ImageDefaultData } from "../../data/shapes/ImageDefaultData";
import type { ImageState } from "../../../types/state/shapes/ImageState";

export const ImageDefaultState = {
	...ImageDefaultData,
	...SelectableDefaultState,
	...TransformativeDefaultState,
} as const satisfies ImageState;;