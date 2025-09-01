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

// Import local modules.

/**
 * TextAreaNode component.
 */
const TextAreaNodeComponent: React.FC<TextAreaNodeProps> = (props) => {
	const {
		id,
		width,
		height,
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
				<>
					<Input
						{...inputState}
						x={0}
						y={-(height / 2 - ((height - 72) / 2 + 16))}
						width={width - 32}
						height={height - 72}
						scaleX={1}
						scaleY={1}
						rotation={0}
						text={text}
						isSelected={isSelected}
						isAncestorSelected={isSelected}
						onDrag={handleDrag}
						onSelect={handleSelect}
						onTextChange={onTextChange}
					/>
					<Button
						id={`${id}-button`}
						x={width / 2 - 56}
						y={height / 2 - 27}
						width={80}
						height={32}
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
				</>
			</Frame>
		</>
	);
};

export const TextAreaNode = memo(TextAreaNodeComponent);
