// Import React.
import { useEffect, useRef } from "react";

// Import types.
import {
	EXECUTION_PROPAGATION_EVENT_NAME,
	type ExecutionPropagationEvent,
} from "../types";

type ExecutionChainProps = {
	id: string;
	onPropagation: (e: ExecutionPropagationEvent) => void;
};

export const useExecutionChain = (props: ExecutionChainProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		...props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	useEffect(() => {
		const handlePropagation = (e: Event) => {
			const customEvent = e as CustomEvent<ExecutionPropagationEvent>;
			// If the event is triggered by itself, do nothing.
			if (customEvent.detail.id === refBus.current.id) return;

			// If this event is targeting the parent component, invoke its onPropagation callback.
			const targetId = customEvent.detail.targetId;
			if (targetId.includes(refBus.current.id)) {
				// Call the onPropagation function passed from the parent component.
				refBus.current.onPropagation(customEvent.detail);
			}
		};
		// Add the event listener to the document object.
		document.addEventListener(
			EXECUTION_PROPAGATION_EVENT_NAME,
			handlePropagation,
		);

		return () => {
			// Remove the event listener from the document object.
			document.removeEventListener(
				EXECUTION_PROPAGATION_EVENT_NAME,
				handlePropagation,
			);
		};
	}, []);
};
