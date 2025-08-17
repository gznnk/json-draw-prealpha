import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { RectangleDefaultState } from "../../../constants/state/shapes/RectangleDefaultState";
import type { RectangleData } from "../../../types/data/shapes/RectangleData";
import type { RectangleState } from "../../../types/state/shapes/RectangleState";

export const mapRectangleDataToState = createDataToStateMapper<RectangleState>(
	RectangleDefaultState,
);

export const rectangleDataToState = (data: RectangleData): RectangleState =>
	mapRectangleDataToState(data);
