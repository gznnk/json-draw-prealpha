// Import React.
import type React from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

// Import types.
import type { TextAreaNodeProps } from "../../../types/props/nodes/TextAreaNodeProps";

// Import components.
import { Rectangle } from "../../shapes/Rectangle";

// Import hooks.
import { useExecutionChain } from "../../../hooks/useExecutionChain";

// Import functions.
import { newEventId } from "../../../utils/core/newEventId";

// Import local modules.
import { TextAreaButton, TextAreaButtonText } from "./TextAreaNodeStyled";

/**
 * TextAreaNode component.
 */
const TextAreaNodeComponent: React.FC<TextAreaNodeProps> = (props) => {
	// State to manage the text content of the TextArea node.
	const [text, setText] = useState<string>(props.text);

	// Apply the props.text to the state when the component mounts or when props.text changes.
	useEffect(() => {
		setText(props.text);
	}, [props.text]);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	/**
	 * Handler for button click events.
	 */
	const handleButtonClick = useCallback(() => {
		// Bypass references to avoid function creation in every render.
		const { props } = refBus.current;
		props.onExecute?.({
			id: props.id,
			eventId: newEventId(),
			eventPhase: "Ended",
			data: {
				text: props.text,
			},
		});
	}, []);

	// Handle execution events for the TextArea node.
	useExecutionChain({
		id: props.id,
		onPropagation: (e) => {
			if (e.eventPhase === "Ended") {
				// Update the text state with the new text from the event data.
				props.onDiagramChange?.({
					id: props.id,
					eventId: e.eventId,
					eventPhase: e.eventPhase,
					startDiagram: {
						text: props.text,
					},
					endDiagram: {
						text: e.data.text,
					},
				});

				// Propagate the event.
				props.onExecute?.({
					id: props.id,
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
		<>
			<Rectangle {...props} text={text} textType="markdown" radius={0} />
			{!props.isTextEditing && (
				<g>
					<TextAreaButton
						x={props.x + props.width / 2 - 38}
						y={props.y + props.height / 2 - 26}
						width={32}
						height={22}
						rx="4"
						ry="4"
						fill="#1890ff"
						stroke="#d9d9d9"
						strokeWidth="1"
						onClick={handleButtonClick}
					/>
					<TextAreaButtonText
						x={props.x + props.width / 2 - 31}
						y={props.y + props.height / 2 - 10}
						fontSize="14px"
						fill="#ffffff"
						pointerEvents="none"
					>
						Go
					</TextAreaButtonText>
				</g>
			)}
		</>
	);
};

export const TextAreaNode = memo(TextAreaNodeComponent);
