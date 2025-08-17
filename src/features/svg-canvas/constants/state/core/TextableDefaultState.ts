import { TextableDefaultData } from "../../data/core/TextableDefaultData";
import type { TextableState } from "../../../types/state/core/TextableState";

export const TextableDefaultState = {
	...TextableDefaultData,
	isTextEditing: false,
} as const satisfies TextableState;