// Import constants.
import { InputDefaultState } from "../../../constants/state/elements/InputDefaultState";
import type { InputState } from "../../../types/state/elements/InputState";
import type { DiagramData } from "../../../types/data/core/DiagramData";
import type { Diagram } from "../../../types/state/core/Diagram";

// Import utils.
import { createDataToStateMapper } from "../../core/createDataToStateMapper";

export const mapInputDataToState = createDataToStateMapper<InputState>(
	InputDefaultState,
);

export const inputDataToState = (data: DiagramData): Diagram =>
	mapInputDataToState(data);