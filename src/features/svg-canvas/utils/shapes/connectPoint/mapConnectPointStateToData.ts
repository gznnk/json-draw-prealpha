import { createStateToDataMapper } from "../../core/createStateToDataMapper";
import { ConnectPointDefaultData } from "../../../constants/data/shapes/ConnectPointDefaultData";
import type { ConnectPointData } from "../../../types/data/shapes/ConnectPointData";
import type { ConnectPointState } from "../../../types/state/shapes/ConnectPointState";

export const mapConnectPointStateToData = createStateToDataMapper<ConnectPointData>(
	ConnectPointDefaultData,
);

export const connectPointStateToData = (state: ConnectPointState): ConnectPointData =>
	mapConnectPointStateToData(state);