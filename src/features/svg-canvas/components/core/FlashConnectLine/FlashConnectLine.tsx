// Import React.
import { useEffect, useState } from "react";

// Import types related to SvgCanvas.
import type { ConnectLineData } from "../../shapes/ConnectLine";

// Import functions related to SvgCanvas.
import { createDValue } from "../../shapes/Path/Path/PathFunctions";

// Import related to this component.
import { FlashPath } from "./FlashConnectLineStyled";
import { FLASH_CONNECT_LINE_EVENT_NAME } from "./FlashConnectConstants";

export const FlashConnectLine = () => {
	const [connectLineList, setConnectLineList] = useState<ConnectLineData[]>([]);

	useEffect(() => {
		const handleFlashConnectLine = (e: Event) => {
			const customEvent = e as CustomEvent<ConnectLineData>;
			const connectLine = customEvent.detail;
			if (connectLine) {
				setConnectLineList((prev) => [...prev, connectLine]);
				setTimeout(() => {
					setConnectLineList((prev) =>
						prev.filter((line) => line.id !== connectLine.id),
					);
				}, 500); // アニメ後にリセット
			}
		};

		document.addEventListener(
			FLASH_CONNECT_LINE_EVENT_NAME,
			handleFlashConnectLine,
		);
		return () => {
			document.removeEventListener(
				FLASH_CONNECT_LINE_EVENT_NAME,
				handleFlashConnectLine,
			);
		};
	}, []);

	return connectLineList.map((connectLine) => (
		<FlashPath
			key={connectLine.id}
			d={createDValue(connectLine.items)}
			$flash={true}
			strokeWidth={connectLine.strokeWidth}
			stroke={connectLine.stroke}
			fill="none"
			pointerEvents="none"
		/>
	));
};
