import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { ConnectPointDefaultState } from "../../../constants/state/shapes/ConnectPointDefaultState";
import type { ConnectPointData } from "../../../types/data/shapes/ConnectPointData";
import type { ConnectPointState } from "../../../types/state/shapes/ConnectPointState";

export const mapConnectPointDataToState =
	createDataToStateMapper<ConnectPointState>(ConnectPointDefaultState);

export const connectPointDataToState = (
	data: ConnectPointData,
): ConnectPointState => mapConnectPointDataToState(data);
