// Import React.
import { useEffect, useRef } from "react";

// Import types related to SvgCanvas.
import {
	PROPAGATION_EVENT_NAME,
	type PropagationEvent,
} from "../types/EventTypes";

type PropagationProps = {
	id: string;
	onPropagation: (e: PropagationEvent) => void;
};

export const usePropagation = (props: PropagationProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		...props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	useEffect(() => {
		const handlePropagation = (e: Event) => {
			const customEvent = e as CustomEvent<PropagationEvent>;
			const targetId = customEvent.detail.targetId;
			if (targetId.includes(refBus.current.id)) {
				// Call the onPropagation function passed from the parent component.
				refBus.current.onPropagation(customEvent.detail);
			}
		};
		// Add the event listener to the document object.
		document.addEventListener(PROPAGATION_EVENT_NAME, handlePropagation);

		return () => {
			// Remove the event listener from the document object.
			document.removeEventListener(PROPAGATION_EVENT_NAME, handlePropagation);
		};
	}, []);
};
