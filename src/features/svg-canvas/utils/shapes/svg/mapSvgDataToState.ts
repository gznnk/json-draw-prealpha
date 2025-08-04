import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { DefaultSvgState } from "../../../constants/state/shapes/DefaultSvgState";
import type { SvgData } from "../../../types/data/shapes/SvgData";
import type { SvgState } from "../../../types/state/shapes/SvgState";

export const mapSvgDataToState = createDataToStateMapper<SvgState>(
	DefaultSvgState,
);

export const svgDataToState = (data: SvgData): SvgState =>
	mapSvgDataToState(data);