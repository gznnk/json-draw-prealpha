import { newEventId } from "../../../../utils";
import type { ConnectLineData } from "../../../../types/shape";
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
