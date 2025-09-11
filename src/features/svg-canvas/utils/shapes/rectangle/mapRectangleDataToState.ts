import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { RectangleDefaultState } from "../../../constants/state/shapes/RectangleDefaultState";
import type { RectangleState } from "../../../types/state/shapes/RectangleState";
import type { DiagramData } from "../../../types/data/core/DiagramData";
import type { Diagram } from "../../../types/state/core/Diagram";

export const mapRectangleDataToState = createDataToStateMapper<RectangleState>(
	RectangleDefaultState,
);

export const rectangleDataToState = (data: DiagramData): Diagram =>
	mapRectangleDataToState(data);
