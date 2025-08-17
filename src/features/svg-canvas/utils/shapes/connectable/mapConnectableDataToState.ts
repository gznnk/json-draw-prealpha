import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { DefaultConnectableState } from "../../../constants/state/shapes/DefaultConnectableState";
import type { ConnectableData } from "../../../types/data/shapes/ConnectableData";
import type { ConnectableState } from "../../../types/state/shapes/ConnectableState";

export const mapConnectableDataToState =
	createDataToStateMapper<ConnectableState>(DefaultConnectableState);

export const connectableDataToState = (
	data: ConnectableData,
): ConnectableState => mapConnectableDataToState(data);
