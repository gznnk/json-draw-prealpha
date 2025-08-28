// Import constants.
import { InputDefaultState } from "../../../constants/state/elements/InputDefaultState";
import type { InputState } from "../../../types/state/elements/InputState";

// Import utils.
import { createDataToStateMapper } from "../../core/createDataToStateMapper";

export const mapInputDataToState = createDataToStateMapper<InputState>(
	InputDefaultState,
);