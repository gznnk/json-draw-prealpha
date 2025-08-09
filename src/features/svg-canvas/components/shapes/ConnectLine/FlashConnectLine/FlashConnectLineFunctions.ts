import { newEventId } from "../../../../utils/core/newEventId";
import type { ConnectLineState } from "../../../../types/state/shapes/ConnectLineState";
import { EVENT_NAME_FLASH_CONNECT_LINE } from "../../../../constants/core/EventNames";

export const triggerFlashConnectLine = (connectLine: ConnectLineState) => {
	document.dispatchEvent(
		new CustomEvent(EVENT_NAME_FLASH_CONNECT_LINE, {
			detail: {
				eventId: newEventId(),
				data: connectLine,
			},
		}),
	);
};
