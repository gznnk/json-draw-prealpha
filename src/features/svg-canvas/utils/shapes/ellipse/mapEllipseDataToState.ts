import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { DefaultEllipseState } from "../../../constants/state/shapes/DefaultEllipseState";
import type { EllipseData } from "../../../types/data/shapes/EllipseData";
import type { EllipseState } from "../../../types/state/shapes/EllipseState";

export const mapEllipseDataToState = createDataToStateMapper<EllipseState>(
	DefaultEllipseState,
);

export const ellipseDataToState = (data: EllipseData): EllipseState =>
	mapEllipseDataToState(data);