import { createStateToDataMapper } from "../../core/createStateToDataMapper";
import { PathPointDefaultData } from "../../../constants/data/shapes/PathPointDefaultData";
import type { PathPointData } from "../../../types/data/shapes/PathPointData";
import type { PathPointState } from "../../../types/state/shapes/PathPointState";

export const mapPathPointStateToData = createStateToDataMapper<PathPointData>(
	PathPointDefaultData,
);

export const pathPointStateToData = (state: PathPointState): PathPointData =>
	mapPathPointStateToData(state);