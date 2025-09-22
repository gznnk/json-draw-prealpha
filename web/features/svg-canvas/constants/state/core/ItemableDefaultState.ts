import type { ItemableState } from "../../../types/state/core/ItemableState";
import { ItemableDefaultData } from "../../data/core/ItemableDefaultData";

export const ItemableDefaultState = {
	...ItemableDefaultData,
	itemableType: "abstract",
} as const satisfies ItemableState;
