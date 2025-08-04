import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { DefaultConnectLineState } from "../../../constants/state/shapes/DefaultConnectLineState";
import type { ConnectLineData } from "../../../types/data/shapes/ConnectLineData";
import type { ConnectLineState } from "../../../types/state/shapes/ConnectLineState";

export const mapConnectLineDataToState = createDataToStateMapper<ConnectLineState>(
	DefaultConnectLineState,
);

export const connectLineDataToState = (data: ConnectLineData): ConnectLineState =>
	mapConnectLineDataToState(data);