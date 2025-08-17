import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { EllipseDefaultState } from "../../../constants/state/shapes/EllipseDefaultState";
import type { EllipseData } from "../../../types/data/shapes/EllipseData";
import type { EllipseState } from "../../../types/state/shapes/EllipseState";

export const mapEllipseDataToState =
	createDataToStateMapper<EllipseState>(EllipseDefaultState);

export const ellipseDataToState = (data: EllipseData): EllipseState =>
	mapEllipseDataToState(data);
