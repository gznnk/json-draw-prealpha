import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { DefaultConnectPointState } from "../../../constants/state/shapes/DefaultConnectPointState";
import type { ConnectPointData } from "../../../types/data/shapes/ConnectPointData";
import type { ConnectPointState } from "../../../types/state/shapes/ConnectPointState";

export const mapConnectPointDataToState = createDataToStateMapper<ConnectPointState>(
	DefaultConnectPointState,
);

export const connectPointDataToState = (data: ConnectPointData): ConnectPointState =>
	mapConnectPointDataToState(data);