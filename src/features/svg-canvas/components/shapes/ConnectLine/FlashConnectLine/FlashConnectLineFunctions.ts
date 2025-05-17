import { newEventId } from "../../../../utils/common/newEventId";
import type { ConnectLineData } from "../../../../types/data/shapes/ConnectLineData";
import { FLASH_CONNECT_LINE_EVENT_NAME } from "./FlashConnectLineConstants";

export const triggerFlashConnectLine = (connectLine: ConnectLineData) => {
	document.dispatchEvent(
		new CustomEvent(FLASH_CONNECT_LINE_EVENT_NAME, {
			detail: {
				eventId: newEventId(),
				data: connectLine,
			},
		}),
	);
};
