// Import constants.
import { ButtonDefaultState } from "../../../constants/state/elements/ButtonDefaultState";
import type { ButtonState } from "../../../types/state/elements/ButtonState";

// Import utils.
import { createDataToStateMapper } from "../../core/createDataToStateMapper";

export const mapButtonDataToState = createDataToStateMapper<ButtonState>(
	ButtonDefaultState,
);