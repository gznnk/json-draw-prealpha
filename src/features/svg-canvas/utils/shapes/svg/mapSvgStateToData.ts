import { createStateToDataMapper } from "../../core/createStateToDataMapper";
import { SvgDefaultData } from "../../../constants/data/shapes/SvgDefaultData";
import type { SvgData } from "../../../types/data/shapes/SvgData";
import type { SvgState } from "../../../types/state/shapes/SvgState";

export const mapSvgStateToData = createStateToDataMapper<SvgData>(
	SvgDefaultData,
);

export const svgStateToData = (state: SvgState): SvgData =>
	mapSvgStateToData(state);