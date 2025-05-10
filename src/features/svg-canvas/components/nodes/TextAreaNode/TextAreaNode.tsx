// Import React.
import type React from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

// Import types related to SvgCanvas.
import type { CreateDiagramProps } from "../../../types/DiagramTypes";

// Import components related to SvgCanvas.
import { Rectangle, type RectangleProps } from "../../shapes/Rectangle";

// Import hooks related to SvgCanvas.
import { useExecutionChain } from "../../../hooks/useExecutionChain";

// Import functions related to SvgCanvas.
import { newEventId } from "../../../utils";

// Imports related to this component.
import { TextAreaButton, TextAreaButtonText } from "./TextAreaNodeStyled";

/**
 * Props for the TextAreaNode component.
 */
type TextAreaProps = CreateDiagramProps<
	RectangleProps,
	{
		executable: true;
	}
>;

/**
 * TextAreaNode component.
 */
const TextAreaNodeComponent: React.FC<TextAreaProps> = (props) => {
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
			eventType: "Instant",
			data: {
				text: props.text,
			},
		});
	}, []);

	// Handle execution events for the TextArea node.
	useExecutionChain({
		id: props.id,
		onPropagation: (e) => {
			if (e.eventType === "End" || e.eventType === "Instant") {
				// Update the text state with the new text from the event data.
				props.onDiagramChange?.({
					id: props.id,
					eventId: e.eventId,
					eventType: e.eventType,
					changeType: "Appearance",
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
					eventType: e.eventType,
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
			<Rectangle {...props} text={text} textType="markdown" />
			{!props.isTextEditing && (
				<>
					<TextAreaButton
						x={props.x + props.width / 2 - 38}
						y={props.y + props.height / 2 - 26}
						width={32}
						height={22}
						rx="10"
						ry="10"
						fill="#2A3147"
						onClick={handleButtonClick}
					/>
					<TextAreaButtonText
						x={props.x + props.width / 2 - 31}
						y={props.y + props.height / 2 - 10}
						fontSize="14px"
						fill="#C0C4D2"
						pointerEvents="none"
					>
						Go
					</TextAreaButtonText>
				</>
			)}
		</>
	);
};

export const TextAreaNode = memo(TextAreaNodeComponent);
