// Import types related to SvgCanvas.
import type { ConnectNodesEvent } from "../../../types/events/ConnectNodesEvent";

// Imports related to this component.
import { CONNECT_NODES_EVENT_NAME } from "./connectNodesConstants";

/**
 * 指定された ConnectNodesEvent を window に dispatch する。
 */
export const dispatchConnectNodesEvent = (e: ConnectNodesEvent) => {
	const event = new CustomEvent(CONNECT_NODES_EVENT_NAME, {
		detail: e,
	});
	window.dispatchEvent(event);
};
