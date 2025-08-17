import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { SvgDefaultState } from "../../../constants/state/shapes/SvgDefaultState";
import type { SvgData } from "../../../types/data/shapes/SvgData";
import type { SvgState } from "../../../types/state/shapes/SvgState";

export const mapSvgDataToState =
	createDataToStateMapper<SvgState>(SvgDefaultState);

export const svgDataToState = (data: SvgData): SvgState =>
	mapSvgDataToState(data);
