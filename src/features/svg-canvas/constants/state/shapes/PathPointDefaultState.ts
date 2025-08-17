import { PathPointDefaultData } from "../../data/shapes/PathPointDefaultData";
import type { PathPointState } from "../../../types/state/shapes/PathPointState";

export const PathPointDefaultState = {
	...PathPointDefaultData,
} as const satisfies PathPointState;;
