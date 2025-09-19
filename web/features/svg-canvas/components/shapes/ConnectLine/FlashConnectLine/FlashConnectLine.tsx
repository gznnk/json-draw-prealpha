import { memo, useEffect, useState } from "react";

import { FlashGroup } from "./FlashConnectLineStyled";
import type { FlashConnectLineEvent } from "./FlashConnectLineTypes";
import { EVENT_NAME_FLASH_CONNECT_LINE } from "../../../../constants/core/EventNames";
import type { PathData } from "../../../../types/data/shapes/PathData";
import {
	createStartPointArrowHead,
	createEndPointArrowHead,
} from "../../../../utils/shapes/path/createArrowHeads";
import { createDValue } from "../../../../utils/shapes/path/createDValue";

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
				}, 500); // Reset after animation
			}
		};

		document.addEventListener(
			EVENT_NAME_FLASH_CONNECT_LINE,
			handleFlashConnectLine,
		);
		return () => {
			document.removeEventListener(
				EVENT_NAME_FLASH_CONNECT_LINE,
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
