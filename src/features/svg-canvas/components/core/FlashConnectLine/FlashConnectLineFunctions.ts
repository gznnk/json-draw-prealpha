import type { ConnectLineData } from "../../shapes/ConnectLine";
import { FLASH_CONNECT_LINE_EVENT_NAME } from "./FlashConnectConstants";

export const triggerFlashConnectLine = (connectLine: ConnectLineData) => {
	document.dispatchEvent(
		new CustomEvent(FLASH_CONNECT_LINE_EVENT_NAME, { detail: connectLine }),
	);
};
