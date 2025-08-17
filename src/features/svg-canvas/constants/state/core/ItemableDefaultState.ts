import { ItemableDefaultData } from "../../data/core/ItemableDefaultData";
import type { Diagram } from "../../../types/state/catalog/Diagram";
import type { ItemableState } from "../../../types/state/core/ItemableState";

export const ItemableDefaultState = {
	...ItemableDefaultData,
} as const satisfies ItemableState<Diagram>;