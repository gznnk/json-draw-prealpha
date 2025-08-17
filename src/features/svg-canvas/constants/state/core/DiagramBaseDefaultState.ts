import { DiagramBaseDefaultData } from "../../data/core/DiagramBaseDefaultData";
import type { DiagramBaseState } from "../../../types/state/core/DiagramBaseState";

export const DiagramBaseDefaultState = {
	...DiagramBaseDefaultData,
} as const satisfies DiagramBaseState;