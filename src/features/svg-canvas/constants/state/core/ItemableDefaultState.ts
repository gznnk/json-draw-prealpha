// Import types.
import type { ItemableState } from "../../../types/state/core/ItemableState";

// Import constants.
import { ItemableDefaultData } from "../../data/core/ItemableDefaultData";

export const ItemableDefaultState = {
	...ItemableDefaultData,
	itemableType: "abstract",
} as const satisfies ItemableState;
