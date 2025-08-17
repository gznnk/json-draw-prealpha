import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { ConnectLineDefaultState } from "../../../constants/state/shapes/ConnectLineDefaultState";
import type { ConnectLineData } from "../../../types/data/shapes/ConnectLineData";
import type { ConnectLineState } from "../../../types/state/shapes/ConnectLineState";

export const mapConnectLineDataToState =
	createDataToStateMapper<ConnectLineState>(ConnectLineDefaultState);

export const connectLineDataToState = (
	data: ConnectLineData,
): ConnectLineState => mapConnectLineDataToState(data);
