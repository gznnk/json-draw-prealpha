import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { DefaultPathState } from "../../../constants/state/shapes/DefaultPathState";
import type { PathData } from "../../../types/data/shapes/PathData";
import type { PathState } from "../../../types/state/shapes/PathState";

export const mapPathDataToState = createDataToStateMapper<PathState>(
	DefaultPathState,
);

export const pathDataToState = (data: PathData): PathState =>
	mapPathDataToState(data);