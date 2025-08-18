// Import types.
import { GroupFeatures } from "../../../types/data/shapes/GroupData";
import type { GroupState } from "../../../types/state/shapes/GroupState";

// Import constants.
import { GroupDefaultData } from "../../data/shapes/GroupDefaultData";

// Import helpers
import { CreateDefaultState } from "./CreateDefaultState";

export const GroupDefaultState = CreateDefaultState<GroupState>({
	type: "Group",
	options: GroupFeatures,
	baseData: GroupDefaultData,
});
