import { createStateToDataMapper } from "../../core/createStateToDataMapper";
import { GroupDefaultData } from "../../../constants/data/shapes/GroupDefaultData";
import type { GroupData } from "../../../types/data/shapes/GroupData";
import type { GroupState } from "../../../types/state/shapes/GroupState";

export const mapGroupStateToData = createStateToDataMapper<GroupData>(
	GroupDefaultData,
);

export const groupStateToData = (state: GroupState): GroupData =>
	mapGroupStateToData(state);