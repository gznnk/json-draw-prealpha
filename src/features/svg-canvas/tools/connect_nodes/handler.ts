// Import functions related to SvgCanvas.
import { newEventId } from "../../utils/Util";
import { dispatchConnectNodesEvent } from "../../canvas/observers/connectNodes";

/**
 * Function to handle the connection between two nodes.
 *
 * @param args - The arguments for the function, including sourceNodeId and targetNodeId.
 * @returns - An object containing the sourceNodeId and targetNodeId of the connected nodes.
 */
// biome-ignore lint/suspicious/noExplicitAny: argument type is not known
export const handler = (args: any) => {
	if ("sourceNodeId" in args && "targetNodeId" in args) {
		// Trigger connect nodes event using the global trigger function
		dispatchConnectNodesEvent({
			eventId: newEventId(),
			sourceNodeId: args.sourceNodeId,
			targetNodeId: args.targetNodeId,
		});

		// Return the connection data.
		return {
			sourceNodeId: args.sourceNodeId,
			targetNodeId: args.targetNodeId,
		};
	}
};
