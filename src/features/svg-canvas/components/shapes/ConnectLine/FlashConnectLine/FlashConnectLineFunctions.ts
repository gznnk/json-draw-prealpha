import { newEventId } from "../../../../utils/common/newEventId";
import type { ConnectLineData } from "../../../../types/data/shapes/ConnectLineData";
import { EVENT_NAME_FLASH_CONNECT_LINE } from "../../../../constants/EventNames";

export const triggerFlashConnectLine = (connectLine: ConnectLineData) => {
	document.dispatchEvent(
		new CustomEvent(EVENT_NAME_FLASH_CONNECT_LINE, {
			detail: {
				eventId: newEventId(),
				data: connectLine,
			},
		}),
	);
};
