// Import React.
import type React from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

// Import types.
import type { TextAreaNodeProps } from "../../../types/props/nodes/TextAreaNodeProps";

// Import hooks.
import { useExecutionChain } from "../../../hooks/useExecutionChain";

// Import components.
import { Text } from "../../elements/Text";

// Import utils.
import { newEventId } from "../../../utils/core/newEventId";

// Import local modules.
import type { TextState } from "../../../types/state/elements/TextState";
import { Frame } from "../../elements/Frame";
import { rotatePoint } from "../../../utils/math/points/rotatePoint";
import { degreesToRadians } from "../../../utils/math/common/degreesToRadians";
import type { DiagramSelectEvent } from "../../../types/events/DiagramSelectEvent";
import { Button } from "../../elements/Button";

/**
 * TextAreaNode component.
 */
const TextAreaNodeComponent: React.FC<TextAreaNodeProps> = (props) => {
	const {
		id,
		x,
		y,
		width,
		height,
		scaleX,
		scaleY,
		rotation,
		items,
		onDrag,
		onSelect,
		onTextChange,
		onDiagramChange,
		onExecute,
	} = props;

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
		onSelect,
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

	// Handler for select events.
	const handleSelect = useCallback((e: DiagramSelectEvent) => {
		const { id, onSelect } = refBus.current;
		onSelect?.({
			...e,
			id,
		});
	}, []);

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

	// Center position of Text component
	const textCenter = rotatePoint(
		x,
		y - height / 2 + 10 + (height - 60) / 2,
		x,
		y,
		degreesToRadians(rotation),
	);

	return (
		<>
			<Frame
				{...props}
				stroke="black"
				strokeWidth="1px"
				fill="white"
				cornerRadius={6}
			>
				<>
					<rect
						x={-width / 2 + 10}
						y={-height / 2 + 10}
						width={width - 20}
						height={height - 60}
						fill="#f0f0f0"
						stroke="black"
						strokeWidth={1}
						rx={6}
						ry={6}
					/>
					<Button
						id={`${id}-button`}
						x={width / 2 - 45}
						y={height / 2 - 25}
						width={70}
						height={30}
						scaleX={1}
						scaleY={1}
						rotation={0}
						keepProportion={true}
						isSelected={false}
						isAncestorSelected={false}
						showOutline={false}
						isTransforming={false}
						showTransformControls={false}
						cornerRadius={6}
						fill="#1677ff"
						stroke="#1677ff"
						strokeWidth="1px"
						text="Submit"
						fontSize={14}
						fontColor="#ffffff"
						fontWeight="normal"
						fontFamily="Arial"
						textAlign="center"
						verticalAlign="center"
						textType="text"
						isTextEditing={false}
						onClick={handleButtonClick}
					/>
				</>
			</Frame>
			<Text
				{...textState}
				x={textCenter.x}
				y={textCenter.y}
				width={width - 20}
				height={height - 50}
				scaleX={scaleX}
				scaleY={scaleY}
				rotation={rotation}
				text={text}
				onDrag={onDrag}
				onSelect={handleSelect}
				onTextChange={onTextChange}
			/>
		</>
	);
};

export const TextAreaNode = memo(TextAreaNodeComponent);
