// Import types related to SvgCanvas.
import type { PathData } from "../../../../types/data/shapes/PathData";
import type { EventBus } from "../../../../../../shared/event-bus/EventBus";

// Imports related to this component.
import { EVENT_NAME_NEW_CONNECT_LINE } from "../../../../constants/EventNames";

/**
 * Function to trigger a new connection line event.
 *
 * @param eventBus - The event bus instance to dispatch the event.
 * @param pathData - The data for the new connection line.
 */
export const triggerNewConnectLine = (
	eventBus: EventBus,
	pathData?: PathData,
) => {
	eventBus.dispatchEvent(
		new CustomEvent(EVENT_NAME_NEW_CONNECT_LINE, {
			detail: {
				data: pathData,
			},
		}),
	);
};
