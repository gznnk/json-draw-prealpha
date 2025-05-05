// Import types related to SvgCanvas.
import type { PathData } from "../../Path";

// Imports related to this component.
import { NEW_CONNECT_LINE_EVENT_NAME } from "./NewConnectLineConstants";

/**
 * Function to trigger a new connection line event.
 *
 * @param pathData - The data for the new connection line.
 */
export const triggerNewConnectLine = (pathData?: PathData) => {
	document.dispatchEvent(
		new CustomEvent(NEW_CONNECT_LINE_EVENT_NAME, {
			detail: {
				data: pathData,
			},
		}),
	);
};
