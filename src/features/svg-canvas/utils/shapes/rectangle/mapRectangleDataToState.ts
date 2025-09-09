import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { RectangleDefaultState } from "../../../constants/state/shapes/RectangleDefaultState";
import type { RectangleState } from "../../../types/state/shapes/RectangleState";
import type { DiagramData } from "../../../types/data/catalog/DiagramData";

export const mapRectangleDataToState = createDataToStateMapper<RectangleState>(
	RectangleDefaultState,
);

export const rectangleDataToState = (data: DiagramData): RectangleState =>
	mapRectangleDataToState(data);
