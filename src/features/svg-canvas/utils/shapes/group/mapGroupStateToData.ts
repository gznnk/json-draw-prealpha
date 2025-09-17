import { createStateToDataMapper } from "../../core/createStateToDataMapper";
import { GroupDefaultData } from "../../../constants/data/shapes/GroupDefaultData";
import type { GroupData } from "../../../types/data/shapes/GroupData";
import type { GroupState } from "../../../types/state/shapes/GroupState";
import type { Diagram } from "../../../types/state/core/Diagram";
import type { DiagramData } from "../../../types/data/core/DiagramData";

export const mapGroupStateToData =
	createStateToDataMapper<GroupData>(GroupDefaultData);

export const groupStateToData = (state: Diagram): DiagramData =>
	mapGroupStateToData(state as GroupState);
