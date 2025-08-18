// Import types.
import { ConnectLineFeatures } from "../../../types/data/shapes/ConnectLineData";
import type { ConnectLineState } from "../../../types/state/shapes/ConnectLineState";

// Import constants.
import { ConnectLineDefaultData } from "../../data/shapes/ConnectLineDefaultData";

// Import helpers
import { CreateDefaultState } from "./CreateDefaultState";

export const ConnectLineDefaultState = CreateDefaultState<ConnectLineState>({
	type: "ConnectLine",
	options: ConnectLineFeatures,
	baseData: ConnectLineDefaultData,
});
