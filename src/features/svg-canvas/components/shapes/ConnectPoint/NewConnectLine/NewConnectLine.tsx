// Import React.
import { memo, useEffect, useState } from "react";

// Import components related to SvgCanvas.
import { Path } from "../../Path";
import type { PathData } from "../../../../types/data/shapes/PathData";
import type { EventBus } from "../../../../../../shared/event-bus/EventBus";

// Import related to this component.
import { NEW_CONNECT_LINE_EVENT_NAME } from "./NewConnectLineConstants";
import type { NewConnectLineEvent } from "./NewConnectLineTypes";

type NewConnectLineProps = {
	eventBus: EventBus;
};

/**
 * Component for rendering a new connection line.
 */
const NewConnectLineComponent: React.FC<NewConnectLineProps> = ({
	eventBus,
}) => {
	const [connectLine, setConnectLine] = useState<PathData>();

	useEffect(() => {
		const handleNewConnectLine = (e: Event) => {
			const customEvent = e as CustomEvent<NewConnectLineEvent>;
			const event = customEvent.detail;
			if (event) {
				setConnectLine(event.data);
			}
		};

		eventBus.addEventListener(
			NEW_CONNECT_LINE_EVENT_NAME,
			handleNewConnectLine,
		);
		return () => {
			eventBus.removeEventListener(
				NEW_CONNECT_LINE_EVENT_NAME,
				handleNewConnectLine,
			);
		};
	}, [eventBus]);

	if (!connectLine) {
		return null;
	}

	return <Path {...connectLine} eventBus={eventBus} />;
};

export const NewConnectLine = memo(NewConnectLineComponent);
