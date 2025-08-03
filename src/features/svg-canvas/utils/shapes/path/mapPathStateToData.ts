import { createStateToDataMapper } from "../../core/createStateToDataMapper";
import { PathDefaultData } from "../../../constants/data/shapes/PathDefaultData";
import type { PathData } from "../../../types/data/shapes/PathData";
import type { PathState } from "../../../types/state/shapes/PathState";

export const mapPathStateToData = createStateToDataMapper<PathData>(
	PathDefaultData,
);

export const pathStateToData = (state: PathState): PathData =>
	mapPathStateToData(state);