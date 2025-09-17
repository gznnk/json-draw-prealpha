// Import constants.
import { ButtonDefaultState } from "../../../constants/state/elements/ButtonDefaultState";
import type { ButtonState } from "../../../types/state/elements/ButtonState";
import type { DiagramData } from "../../../types/data/core/DiagramData";
import type { Diagram } from "../../../types/state/core/Diagram";

// Import utils.
import { createDataToStateMapper } from "../../core/createDataToStateMapper";

export const mapButtonDataToState = createDataToStateMapper<ButtonState>(
	ButtonDefaultState,
);

export const buttonDataToState = (data: DiagramData): Diagram =>
	mapButtonDataToState(data);