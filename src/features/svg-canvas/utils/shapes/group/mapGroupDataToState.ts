import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { GroupDefaultState } from "../../../constants/state/shapes/GroupDefaultState";
import type { GroupData } from "../../../types/data/shapes/GroupData";
import type { GroupState } from "../../../types/state/shapes/GroupState";

export const mapGroupDataToState =
	createDataToStateMapper<GroupState>(GroupDefaultState);

export const groupDataToState = (data: GroupData): GroupState =>
	mapGroupDataToState(data);
