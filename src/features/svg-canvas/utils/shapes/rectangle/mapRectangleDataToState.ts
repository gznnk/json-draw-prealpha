import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { DefaultRectangleState } from "../../../constants/state/shapes/DefaultRectangleState";
import type { RectangleData } from "../../../types/data/shapes/RectangleData";
import type { RectangleState } from "../../../types/state/shapes/RectangleState";

export const mapRectangleDataToState = createDataToStateMapper<RectangleState>(
	DefaultRectangleState,
);

export const rectangleDataToState = (data: RectangleData): RectangleState =>
	mapRectangleDataToState(data);