import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { DefaultConnectableState } from "../../../constants/state/core/DefaultConnectableState";
import type {
	ConnectableData,
	ConnectableState,
} from "../../../types/diagrams/shapes/ConnectableTypes";

export const mapConnectableDataToState =
	createDataToStateMapper<ConnectableState>(DefaultConnectableState);

export const connectableDataToState = (
	data: ConnectableData,
): ConnectableState => mapConnectableDataToState(data);
