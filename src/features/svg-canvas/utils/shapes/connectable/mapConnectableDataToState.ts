import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { ConnectableDefaultState } from "../../../constants/state/shapes/ConnectableDefaultState";
import type { ConnectableData } from "../../../types/data/shapes/ConnectableData";
import type { ConnectableState } from "../../../types/state/shapes/ConnectableState";

export const mapConnectableDataToState =
	createDataToStateMapper<ConnectableState>(ConnectableDefaultState);

export const connectableDataToState = (
	data: ConnectableData,
): ConnectableState => mapConnectableDataToState(data);
