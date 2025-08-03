import { FillableDefaultData } from "../../data/core/FillableDefaultData";
import type { FillableState } from "../../../types/state/core/FillableState";

export const DefaultFillableState = {
	...FillableDefaultData,
} as const satisfies FillableState;