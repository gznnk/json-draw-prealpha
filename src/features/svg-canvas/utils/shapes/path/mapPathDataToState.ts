import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { PathDefaultState } from "../../../constants/state/shapes/PathDefaultState";
import type { PathData } from "../../../types/data/shapes/PathData";
import type { PathState } from "../../../types/state/shapes/PathState";

export const mapPathDataToState =
	createDataToStateMapper<PathState>(PathDefaultState);

export const pathDataToState = (data: PathData): PathState =>
	mapPathDataToState(data);
