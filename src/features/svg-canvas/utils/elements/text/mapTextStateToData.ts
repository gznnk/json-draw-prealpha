import { createStateToDataMapper } from "../../core/createStateToDataMapper";
import { TextDefaultData } from "../../../constants/data/elements/TextDefaultData";
import type { TextData } from "../../../types/data/elements/TextData";
import type { TextState } from "../../../types/state/elements/TextState";

export const mapTextStateToData = createStateToDataMapper<TextData>(
	TextDefaultData,
);

export const textStateToData = (state: TextState): TextData =>
	mapTextStateToData(state);