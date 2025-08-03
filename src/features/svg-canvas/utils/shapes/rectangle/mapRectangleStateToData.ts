import { createStateToDataMapper } from "../../core/createStateToDataMapper";
import { RectangleDefaultData } from "../../../constants/data/shapes/RectangleDefaultData";
import type { RectangleData } from "../../../types/data/shapes/RectangleData";
import type { RectangleState } from "../../../types/state/shapes/RectangleState";

export const mapRectangleStateToData = createStateToDataMapper<RectangleData>(
	RectangleDefaultData,
);

export const rectangleStateToData = (state: RectangleState): RectangleData =>
	mapRectangleStateToData(state);