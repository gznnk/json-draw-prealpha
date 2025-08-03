import { createStateToDataMapper } from "../../core/createStateToDataMapper";
import { ConnectableDefaultData } from "../../../constants/data/shapes/ConnectableDefaultData";
import type { ConnectableData } from "../../../types/data/shapes/ConnectableData";
import type { ConnectableState } from "../../../types/state/shapes/ConnectableState";

export const mapConnectableStateToData = createStateToDataMapper<ConnectableData>(
	ConnectableDefaultData,
);

export const connectableStateToData = (state: ConnectableState): ConnectableData =>
	mapConnectableStateToData(state);