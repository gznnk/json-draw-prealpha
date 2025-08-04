import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { DefaultGroupState } from "../../../constants/state/shapes/DefaultGroupState";
import type { GroupData } from "../../../types/data/shapes/GroupData";
import type { GroupState } from "../../../types/state/shapes/GroupState";

export const mapGroupDataToState = createDataToStateMapper<GroupState>(
	DefaultGroupState,
);

export const groupDataToState = (data: GroupData): GroupState =>
	mapGroupDataToState(data);