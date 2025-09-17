import { createStateToDataMapper } from "../../core/createStateToDataMapper";
import { EllipseDefaultData } from "../../../constants/data/shapes/EllipseDefaultData";
import type { EllipseData } from "../../../types/data/shapes/EllipseData";
import type { EllipseState } from "../../../types/state/shapes/EllipseState";
import type { Diagram } from "../../../types/state/core/Diagram";
import type { DiagramData } from "../../../types/data/core/DiagramData";

export const mapEllipseStateToData =
	createStateToDataMapper<EllipseData>(EllipseDefaultData);

export const ellipseStateToData = (state: Diagram): DiagramData =>
	mapEllipseStateToData(state as EllipseState);
