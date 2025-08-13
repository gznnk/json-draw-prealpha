import { createStateToDataMapper } from "../../core/createStateToDataMapper";
import { ConnectableDefaultData } from "../../../constants/data/shapes/ConnectableDefaultData";
import type {
	ConnectableData,
	ConnectableState,
} from "../../../types/diagrams/shapes/ConnectableTypes";

export const mapConnectableStateToData =
	createStateToDataMapper<ConnectableData>(ConnectableDefaultData);

export const connectableStateToData = (
	state: ConnectableState,
): ConnectableData => mapConnectableStateToData(state);
