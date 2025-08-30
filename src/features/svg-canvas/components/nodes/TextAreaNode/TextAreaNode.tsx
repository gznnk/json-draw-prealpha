// Import React.
import type React from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

// Import types.
import type { DiagramSelectEvent } from "../../../types/events/DiagramSelectEvent";
import type { ExecutionPropagationEvent } from "../../../types/events/ExecutionPropagationEvent";
import type { TextAreaNodeProps } from "../../../types/props/nodes/TextAreaNodeProps";
import type { TextState } from "../../../types/state/elements/TextState";

// Import components.
import { Button } from "../../elements/Button";
import { Frame } from "../../elements/Frame";
import { Input } from "../../elements/Input";

// Import utils.
import { newEventId } from "../../../utils/core/newEventId";

// Import local modules.
import { degreesToRadians } from "../../../utils/math/common/degreesToRadians";
import { rotatePoint } from "../../../utils/math/points/rotatePoint";
import type { DiagramDragEvent } from "../../../types/events/DiagramDragEvent";

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
		onDrag,
		onSelect,
		onExecute,
		onDiagramChange,
		textState,
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
		const { id, text, textState, onDiagramChange, onExecute, setText } =
			refBus.current;

		if (e.eventPhase === "Ended") {
			// Update the text state with the new text from the event data.
			onDiagramChange?.({
				id: textState.id,
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

	// Center position of Input component
	const inputCenter = rotatePoint(
		x,
		y - height / 2 + 16 + (height - 72) / 2,
		x,
		y,
		degreesToRadians(rotation),
	);

	return (
		<>
			<Frame
				{...props}
				stroke="#E5E6EB"
				strokeWidth="1px"
				fill="white"
				cornerRadius={6}
				onPropagation={onPropagation}
			>
				<Button
					id={`${id}-button`}
					x={width / 2 - 51}
					y={height / 2 - 27}
					width={70}
					height={32}
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
					text="Send"
					fontSize={14}
					fontColor="#ffffff"
					fontWeight="normal"
					fontFamily="Arial"
					textAlign="center"
					verticalAlign="center"
					textType="text"
					isTextEditing={false}
					onDrag={handleDrag}
					onSelect={handleSelect}
					onClick={handleButtonClick}
				/>
			</Frame>
			<Input
				{...textState}
				x={inputCenter.x}
				y={inputCenter.y}
				width={width - 32}
				height={height - 72}
				scaleX={scaleX}
				scaleY={scaleY}
				rotation={rotation}
				cornerRadius={6}
				text={text}
				fill="#FFFFFF"
				stroke="#D9D9D9"
				strokeWidth="1px"
				onDrag={handleDrag}
				onSelect={handleSelect}
				onTextChange={onTextChange}
			/>
		</>
	);
};

export const TextAreaNode = memo(TextAreaNodeComponent);
