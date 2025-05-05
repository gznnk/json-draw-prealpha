// Import React.
import { memo, useEffect, useState } from "react";

// Import components related to SvgCanvas.
import { Path, type PathData } from "../../Path";

// Import related to this component.
import { NEW_CONNECT_LINE_EVENT_NAME } from "./NewConnectLineConstants";
import type { NewConnectLineEvent } from "./NewConnectLineTypes";

/**
 * Component for rendering a new connection line.
 */
export const NewConnectLineComponent = () => {
	const [connectLine, setConnectLine] = useState<PathData>();

	useEffect(() => {
		const handleNewConnectLine = (e: Event) => {
			const customEvent = e as CustomEvent<NewConnectLineEvent>;
			const event = customEvent.detail;
			if (event) {
				setConnectLine(event.data);
			}
		};

		document.addEventListener(
			NEW_CONNECT_LINE_EVENT_NAME,
			handleNewConnectLine,
		);
		return () => {
			document.removeEventListener(
				NEW_CONNECT_LINE_EVENT_NAME,
				handleNewConnectLine,
			);
		};
	}, []);

	if (!connectLine) {
		return null;
	}

	return <Path {...connectLine} />;
};

export const NewConnectLine = memo(NewConnectLineComponent);
