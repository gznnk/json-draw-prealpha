import { StrokableDefaultData } from "../../data/core/StrokableDefaultData";
import type { StrokableState } from "../../../types/state/core/StrokableState";

export const DefaultStrokableState = {
	...StrokableDefaultData,
} as const satisfies StrokableState;