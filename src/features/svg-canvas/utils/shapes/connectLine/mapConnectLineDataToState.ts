import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { ConnectLineDefaultState } from "../../../constants/state/shapes/ConnectLineDefaultState";
import type { DiagramData } from "../../../types/data/core/DiagramData";
import type { Diagram } from "../../../types/state/core/Diagram";
import type { ConnectLineState } from "../../../types/state/shapes/ConnectLineState";

export const mapConnectLineDataToState =
	createDataToStateMapper<ConnectLineState>(ConnectLineDefaultState);

export const connectLineDataToState = (
	data: DiagramData,
): Diagram => mapConnectLineDataToState(data);
