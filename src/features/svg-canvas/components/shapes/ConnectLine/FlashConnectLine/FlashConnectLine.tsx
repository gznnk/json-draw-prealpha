// Import React.
import { memo, useEffect, useState } from "react";

// Import functions related to SvgCanvas.
import {
	createDValue,
	createEndPointArrowHead,
	createStartPointArrowHead,
} from "../../../../utils/shapes/path";
import type { PathData } from "../../../../types/data";

// Import related to this component.
import { FLASH_CONNECT_LINE_EVENT_NAME } from "./FlashConnectLineConstants";
import { FlashGroup } from "./FlashConnectLineStyled";
import type { FlashConnectLineEvent } from "./FlashConnectLineTypes";

export const FlashConnectLineComponent = () => {
	const [connectLineList, setConnectLineList] = useState<
		FlashConnectLineEvent[]
	>([]);

	useEffect(() => {
		const handleFlashConnectLine = (e: Event) => {
			const customEvent = e as CustomEvent<FlashConnectLineEvent>;
			const event = customEvent.detail;
			if (event) {
				setConnectLineList((prev) => [...prev, event]);
				setTimeout(() => {
					setConnectLineList((prev) =>
						prev.filter(
							(line) =>
								line.data.id !== event.data.id &&
								line.eventId !== event.eventId,
						),
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
		<FlashGroup
			$flash={true}
			key={`${connectLine.data.id}-${connectLine.eventId}`}
		>
			<path
				d={createDValue(connectLine.data.items)}
				strokeWidth={connectLine.data.strokeWidth}
				stroke={connectLine.data.stroke}
				fill="none"
				pointerEvents="none"
			/>
			{createStartPointArrowHead(connectLine.data as PathData)}
			{createEndPointArrowHead(connectLine.data as PathData)}
		</FlashGroup>
	));
};

export const FlashConnectLine = memo(FlashConnectLineComponent);
