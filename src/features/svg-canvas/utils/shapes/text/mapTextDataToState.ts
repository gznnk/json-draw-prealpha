import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { TextDefaultState } from "../../../constants/state/shapes/TextDefaultState";
import type { TextData } from "../../../types/data/shapes/TextData";
import type { TextState } from "../../../types/state/shapes/TextState";

export const mapTextDataToState = createDataToStateMapper<TextState>(
	TextDefaultState,
);

export const textDataToState = (data: TextData): TextState =>
	mapTextDataToState(data);