import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { TextDefaultState } from "../../../constants/state/elements/TextDefaultState";
import type { TextData } from "../../../types/data/elements/TextData";
import type { TextState } from "../../../types/state/elements/TextState";

export const mapTextDataToState = createDataToStateMapper<TextState>(
	TextDefaultState,
);

export const textDataToState = (data: TextData): TextState =>
	mapTextDataToState(data);