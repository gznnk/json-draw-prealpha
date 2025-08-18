// Import types.
import type { PathState } from "../../../types/state/shapes/PathState";
import { PathFeatures } from "../../../types/data/shapes/PathData";

// Import constants.
import { PathDefaultData } from "../../data/shapes/PathDefaultData";

// Import helpers.
import { CreateDefaultState } from "./CreateDefaultState";

export const PathDefaultState = CreateDefaultState<PathState>({
	type: "Path",
	options: PathFeatures,
	baseData: PathDefaultData,
});
