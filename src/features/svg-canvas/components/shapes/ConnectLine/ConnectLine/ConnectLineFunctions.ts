import type { ConnectPointsMoveEvent } from "../../../../types/EventTypes";

// Imports related to this component.
import { EVENT_NAME_CONNECT_POINTS_MOVE } from "./ConnectLineConstants";

/**
 * Trigger the ConnectPoint components move event.
 *
 * @param e - ConnectPoint components move event data.
 */
export const notifyConnectPointsMove = (e: ConnectPointsMoveEvent) => {
	document.dispatchEvent(
		new CustomEvent(EVENT_NAME_CONNECT_POINTS_MOVE, {
			detail: e,
		}),
	);
};
