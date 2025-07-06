// Import React.
import { memo, useEffect, useState } from "react";

// Import types.
import type { PathData } from "../../../../types/data/shapes/PathData";

// Import components.
import { Path } from "../../Path";

// Import constants.
import { EVENT_NAME_NEW_CONNECT_LINE } from "../../../../constants/EventNames";

// Import context.
import { useEventBus } from "../../../../context/EventBusContext";

// Import local module files.
import type { NewConnectLineEvent } from "./NewConnectLineTypes";

/**
 * Component for rendering a new connection line.
 *
 * This component exists to ensure that the new connection line is rendered
 * on top of all other shapes. It is positioned at the front of the render order
 * in SvgCanvas to achieve this visual layering effect.
 */
const NewConnectLineComponent: React.FC = () => {
	const eventBus = useEventBus();
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
			EVENT_NAME_NEW_CONNECT_LINE,
			handleNewConnectLine,
		);
		return () => {
			eventBus.removeEventListener(
				EVENT_NAME_NEW_CONNECT_LINE,
				handleNewConnectLine,
			);
		};
	}, [eventBus]);

	if (!connectLine) {
		return null;
	}

	return <Path {...connectLine} />;
};

export const NewConnectLine = memo(NewConnectLineComponent);
