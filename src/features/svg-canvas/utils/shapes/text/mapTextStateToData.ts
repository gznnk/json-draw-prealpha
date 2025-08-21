import { createStateToDataMapper } from "../../core/createStateToDataMapper";
import { TextDefaultData } from "../../../constants/data/shapes/TextDefaultData";
import type { TextData } from "../../../types/data/shapes/TextData";
import type { TextState } from "../../../types/state/shapes/TextState";

export const mapTextStateToData = createStateToDataMapper<TextData>(
	TextDefaultData,
);

export const textStateToData = (state: TextState): TextData =>
	mapTextStateToData(state);