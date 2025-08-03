import { createStateToDataMapper } from "../../core/createStateToDataMapper";
import { ConnectLineDefaultData } from "../../../constants/data/shapes/ConnectLineDefaultData";
import type { ConnectLineData } from "../../../types/data/shapes/ConnectLineData";
import type { ConnectLineState } from "../../../types/state/shapes/ConnectLineState";

export const mapConnectLineStateToData = createStateToDataMapper<ConnectLineData>(
	ConnectLineDefaultData,
);

export const connectLineStateToData = (state: ConnectLineState): ConnectLineData =>
	mapConnectLineStateToData(state);