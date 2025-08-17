import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { PathPointDefaultState } from "../../../constants/state/shapes/PathPointDefaultState";
import type { PathPointData } from "../../../types/data/shapes/PathPointData";
import type { PathPointState } from "../../../types/state/shapes/PathPointState";

export const mapPathPointDataToState = createDataToStateMapper<PathPointState>(
	PathPointDefaultState,
);

export const pathPointDataToState = (data: PathPointData): PathPointState =>
	mapPathPointDataToState(data);
