/**
 * Event fired when connecting two nodes in a diagram
 */
export type ConnectNodesEvent = {
	eventId: string;
	sourceNodeId: string;
	targetNodeId: string;
};
