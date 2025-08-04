import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { DefaultPathPointState } from "../../../constants/state/shapes/DefaultPathPointState";
import type { PathPointData } from "../../../types/data/shapes/PathPointData";
import type { PathPointState } from "../../../types/state/shapes/PathPointState";

export const mapPathPointDataToState = createDataToStateMapper<PathPointState>(
	DefaultPathPointState,
);

export const pathPointDataToState = (data: PathPointData): PathPointState =>
	mapPathPointDataToState(data);