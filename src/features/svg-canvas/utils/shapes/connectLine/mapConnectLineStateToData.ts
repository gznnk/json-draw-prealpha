import { createStateToDataMapper } from "../../core/createStateToDataMapper";
import { ConnectLineDefaultData } from "../../../constants/data/shapes/ConnectLineDefaultData";
import type { ConnectLineData } from "../../../types/data/shapes/ConnectLineData";
import type { ConnectLineState } from "../../../types/state/shapes/ConnectLineState";
import type { Diagram } from "../../../types/state/catalog/Diagram";
import type { DiagramData } from "../../../types/data/catalog/DiagramData";

export const mapConnectLineStateToData = createStateToDataMapper<ConnectLineData>(
	ConnectLineDefaultData,
);

export const connectLineStateToData = (state: Diagram): DiagramData =>
	mapConnectLineStateToData(state as ConnectLineState);