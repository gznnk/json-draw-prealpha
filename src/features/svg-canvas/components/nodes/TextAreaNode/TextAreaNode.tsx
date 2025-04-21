// Import React.
import type React from "react";
import { memo, useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { ExecuteEvent } from "../../../types/EventTypes";

// Import components related to SvgCanvas.
import { Rectangle, type RectangleProps } from "../../shapes/Rectangle";

// Import hooks related to SvgCanvas.
import { useExecutionChain } from "../../../hooks/useExecutionChain";

// Import functions related to SvgCanvas.
import { newEventId } from "../../../utils/Util";

// Imports related to this component.
import { TextAreaButton, TextAreaButtonText } from "./TextAreaNodeStyled";

type TextAreaProps = RectangleProps & {
	onExecute: (e: ExecuteEvent) => void;
};

const TextAreaNodeComponent: React.FC<TextAreaProps> = (props) => {
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

		props.onExecute({
			id: props.id,
			eventId: newEventId(),
			data: {
				text: props.text,
			},
		});
	}, []);

	// Handle execution events for the TextArea node.
	useExecutionChain({
		id: props.id,
		onPropagation: (e) => {
			props.onDiagramChange?.({
				id: props.id,
				eventId: e.eventId,
				eventType: "Instant",
				changeType: "Appearance",
				startDiagram: {
					text: props.text,
				},
				endDiagram: {
					text: e.data.text,
				},
			});
			props.onExecute?.({
				id: props.id,
				eventId: e.eventId,
				data: {
					text: e.data.text,
				},
			});
		},
	});

	return (
		<>
			<Rectangle {...props} />
			{!props.isTextEditing && (
				<>
					<TextAreaButton
						x={props.x + props.width / 2 - 38}
						y={props.y + props.height / 2 - 26}
						width={32}
						height={22}
						rx="10"
						ry="10"
						fill="#5ea6cb"
						onClick={handleButtonClick}
					/>
					<TextAreaButtonText
						x={props.x + props.width / 2 - 31}
						y={props.y + props.height / 2 - 10}
						fontSize="14px"
						fill="#ffffff"
						pointerEvents="none"
						onPointerUp={handleButtonClick}
					>
						Go
					</TextAreaButtonText>
				</>
			)}
		</>
	);
};

export const TextAreaNode = memo(TextAreaNodeComponent);
