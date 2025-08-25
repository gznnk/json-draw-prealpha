// Import React.
import type React from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

// Import types.
import type { TextAreaNodeProps } from "../../../types/props/nodes/TextAreaNodeProps";

// Import hooks.
import { useExecutionChain } from "../../../hooks/useExecutionChain";

// Import utils.
import { newEventId } from "../../../utils/core/newEventId";

// Import local modules.
import type { TextState } from "../../../types/state/elements/TextState";
import { Frame } from "../../elements/Frame";

/**
 * TextAreaNode component.
 */
const TextAreaNodeComponent: React.FC<TextAreaNodeProps> = (props) => {
	const { id, width, height, items, onDiagramChange, onExecute } = props;

	const textState = items[0] as TextState;
	// State to manage the text content of the TextArea node.
	const [text, setText] = useState<string>(textState.text);

	// Apply the props.text to the state when the component mounts or when props.text changes.
	useEffect(() => {
		setText(textState.text);
	}, [textState]);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		id,
		text,
		onExecute,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	/**
	 * Handler for button click events.
	 */
	const handleButtonClick = useCallback(() => {
		// Bypass references to avoid function creation in every render.
		const { text, id, onExecute } = refBus.current;
		onExecute?.({
			id,
			eventId: newEventId(),
			eventPhase: "Ended",
			data: {
				text,
			},
		});
	}, []);

	console.log(handleButtonClick);

	// Handle execution events for the TextArea node.
	useExecutionChain({
		id,
		onPropagation: (e) => {
			if (e.eventPhase === "Ended") {
				// Update the text state with the new text from the event data.
				onDiagramChange?.({
					id,
					eventId: e.eventId,
					eventPhase: e.eventPhase,
					startDiagram: {
						text: text,
					},
					endDiagram: {
						text: e.data.text,
					},
				});

				// Propagate the event.
				onExecute?.({
					id,
					eventId: e.eventId,
					eventPhase: e.eventPhase,
					data: {
						text: e.data.text,
					},
				});
			} else {
				setText(e.data.text);
			}
		},
	});

	return (
		<Frame {...props} stroke="black" strokeWidth="1px" fill="white">
			<>
				<rect
					x={-width / 2 + 10}
					y={-height / 2 + 10}
					width={width - 20}
					height={height - 50}
					fill="transparent"
					stroke="black"
					strokeWidth={1}
				/>
				<rect
					x={width / 2 - 50}
					y={height / 2 - 30}
					width={40}
					height={20}
					fill="transparent"
					stroke="black"
					strokeWidth={1}
				/>
			</>
		</Frame>
	);
};

export const TextAreaNode = memo(TextAreaNodeComponent);
