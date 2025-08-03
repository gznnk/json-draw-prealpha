import { createStateToDataMapper } from "../../core/createStateToDataMapper";
import { EllipseDefaultData } from "../../../constants/data/shapes/EllipseDefaultData";
import type { EllipseData } from "../../../types/data/shapes/EllipseData";
import type { EllipseState } from "../../../types/state/shapes/EllipseState";

export const mapEllipseStateToData = createStateToDataMapper<EllipseData>(
	EllipseDefaultData,
);

export const ellipseStateToData = (state: EllipseState): EllipseData =>
	mapEllipseStateToData(state);