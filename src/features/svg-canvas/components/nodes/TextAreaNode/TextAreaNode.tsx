// Import React.
import type React from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

// Import types.
import type { DiagramDragEvent } from "../../../types/events/DiagramDragEvent";
import type { DiagramSelectEvent } from "../../../types/events/DiagramSelectEvent";
import type { ExecutionPropagationEvent } from "../../../types/events/ExecutionPropagationEvent";
import type { TextAreaNodeProps } from "../../../types/props/nodes/TextAreaNodeProps";
import type { InputState } from "../../../types/state/elements/InputState";

// Import components.
import { Button } from "../../elements/Button";
import { Frame } from "../../elements/Frame";
import { Input } from "../../elements/Input";

// Import utils.
import { newEventId } from "../../../utils/core/newEventId";
import { degreesToRadians } from "../../../utils/math/common/degreesToRadians";
import { affineTransformation } from "../../../utils/math/transform/affineTransformation";

// Import local modules.
import {
	BASE_MARGIN,
	BUTTON_HEIGHT,
	BUTTON_MARGIN_BOTTOM,
	BUTTON_MARGIN_TOP,
	BUTTON_WIDTH,
} from "./TextAreaConstants";

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
		isSelected,
		onDrag,
		onSelect,
		onTextChange,
		onDiagramChange,
		onExecute,
	} = props;

	const inputState = items[0] as InputState;
	// State to manage the text content of the TextArea node.
	const [text, setText] = useState<string>(inputState.text);

	// Apply the props.text to the state when the component mounts or when props.text changes.
	useEffect(() => {
		setText(inputState.text);
	}, [inputState.text]);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		id,
		text,
		onDrag,
		onSelect,
		onExecute,
		onDiagramChange,
		inputState,
		setText,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	// Handler for drag events.
	const handleDrag = useCallback((e: DiagramDragEvent) => {
		const { id, onDrag } = refBus.current;
		onDrag?.({
			...e,
			id,
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

	// Handler for button click events.
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

	// Handle propagation events from child components
	const onPropagation = useCallback((e: ExecutionPropagationEvent) => {
		const { id, text, inputState, onDiagramChange, onExecute, setText } =
			refBus.current;

		if (e.eventPhase === "Ended") {
			// Update the text state with the new text from the event data.
			onDiagramChange?.({
				id: inputState.id,
				eventId: e.eventId,
				eventPhase: e.eventPhase,
				startDiagram: {
					text,
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
	}, []);

	const inputHeight =
		height -
		(BASE_MARGIN + BUTTON_HEIGHT + BUTTON_MARGIN_TOP + BUTTON_MARGIN_BOTTOM);

	const inputCenter = affineTransformation(
		0,
		-(height / 2 - (inputHeight / 2 + BASE_MARGIN)),
		scaleX,
		scaleY,
		degreesToRadians(rotation),
		x,
		y,
	);

	const buttonX = width / 2 - BUTTON_WIDTH / 2 - BASE_MARGIN;
	const buttonY = height / 2 - BUTTON_HEIGHT / 2 - BUTTON_MARGIN_BOTTOM;

	return (
		<>
			<Frame
				{...props}
				minWidth={200}
				minHeight={100}
				stroke="#E5E6EB"
				strokeWidth="1px"
				fill="white"
				cornerRadius={6}
				onPropagation={onPropagation}
			>
				<Button
					id={`${id}-button`}
					x={buttonX}
					y={buttonY}
					width={BUTTON_WIDTH}
					height={BUTTON_HEIGHT}
					scaleX={1}
					scaleY={1}
					rotation={0}
					keepProportion={false}
					isSelected={false}
					isAncestorSelected={false}
					showOutline={false}
					isTransforming={false}
					showTransformControls={false}
					text="Send"
					isTextEditing={false}
					effectsEnabled
					onDrag={handleDrag}
					onClick={handleButtonClick}
				/>
			</Frame>
			<Input
				{...inputState}
				x={inputCenter.x}
				y={inputCenter.y}
				width={width - BASE_MARGIN * 2}
				height={inputHeight}
				scaleX={scaleX}
				scaleY={scaleY}
				rotation={rotation}
				text={text}
				isSelected={isSelected}
				isAncestorSelected={isSelected}
				showOutline={false}
				isTransforming={false}
				showTransformControls={false}
				onDrag={handleDrag}
				onSelect={handleSelect}
				onTextChange={onTextChange}
			/>
		</>
	);
};

export const TextAreaNode = memo(TextAreaNodeComponent);
