import type React from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

import {
	BASE_MARGIN,
	HEADER_HEIGHT,
	HEADER_MARGIN_BOTTOM,
	HEADER_MARGIN_TOP,
} from "../../../constants/styling/core/LayoutStyling";
import {
	BACKGROUND_COLOR,
	BORDER_COLOR,
	BORDER_WIDTH,
	BUTTON_HEIGHT,
	BUTTON_MARGIN_BOTTOM,
	BUTTON_MARGIN_TOP,
	BUTTON_WIDTH,
	CORNER_RADIUS,
	ICON_COLOR,
	MIN_HEIGHT,
	MIN_WIDTH,
} from "../../../constants/styling/nodes/TextAreaNodeStyling";
import type { DiagramClickEvent } from "../../../types/events/DiagramClickEvent";
import type { DiagramDragEvent } from "../../../types/events/DiagramDragEvent";
import type { DiagramHoverChangeEvent } from "../../../types/events/DiagramHoverChangeEvent";
import type { DiagramSelectEvent } from "../../../types/events/DiagramSelectEvent";
import type { ExecutionPropagationEvent } from "../../../types/events/ExecutionPropagationEvent";
import type { TextAreaNodeProps } from "../../../types/props/nodes/TextAreaNodeProps";
import type { InputState } from "../../../types/state/elements/InputState";
import type { NodeHeaderState } from "../../../types/state/elements/NodeHeaderState";
import { newEventId } from "../../../utils/core/newEventId";
import { degreesToRadians } from "../../../utils/math/common/degreesToRadians";
import { efficientAffineTransformation } from "../../../utils/math/transform/efficientAffineTransformation";
import { Button } from "../../elements/Button";
import { Frame } from "../../elements/Frame";
import { Input } from "../../elements/Input";
import { NodeHeader } from "../../elements/NodeHeader";
import { TextArea } from "../../icons/TextArea";

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
		isAncestorSelected,
		minWidth = MIN_WIDTH,
		minHeight = MIN_HEIGHT,
		onDrag,
		onSelect,
		onClick,
		onHoverChange,
		onTextChange,
		onExecute,
	} = props;

	const nodeHeaderState = items[0] as NodeHeaderState;
	const inputState = items[1] as InputState;
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
		onClick,
		onHoverChange,
		onTextChange,
		onExecute,
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

	// Handler for click events.
	const handleClick = useCallback((e: DiagramClickEvent) => {
		const { id, onClick } = refBus.current;
		onClick?.({
			...e,
			id,
		});
	}, []);

	// Handler for hover change events.
	const handleHoverChange = useCallback((e: DiagramHoverChangeEvent) => {
		const { id, onHoverChange } = refBus.current;
		onHoverChange?.({
			...e,
			id,
		});
	}, []);

	// Handler for button click events.
	const handleButtonClick = useCallback(() => {
		// Bypass references to avoid function creation in every render.
		const { text, id, onExecute } = refBus.current;
		const eventId = newEventId();
		onExecute?.({
			id,
			eventId,
			eventPhase: "Started",
			data: {
				text: "",
			},
		});
		onExecute?.({
			id,
			eventId,
			eventPhase: "Ended",
			data: {
				text,
			},
		});
	}, []);

	// Handle propagation events from child components
	const onPropagation = useCallback((e: ExecutionPropagationEvent) => {
		const { id, inputState, onTextChange, onExecute, setText } = refBus.current;

		setText(e.data.text);

		if (e.eventPhase === "Ended") {
			// Update the text state with the new text from the event data.
			onTextChange?.({
				id: inputState.id,
				eventId: e.eventId,
				eventPhase: e.eventPhase,
				text: e.data.text,
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
		}
	}, []);

	const inputHeight =
		height -
		(HEADER_MARGIN_TOP +
			HEADER_HEIGHT +
			HEADER_MARGIN_BOTTOM +
			BUTTON_HEIGHT +
			BUTTON_MARGIN_TOP +
			BUTTON_MARGIN_BOTTOM);

	const headerCenter = efficientAffineTransformation(
		0,
		-(height / 2 - (HEADER_HEIGHT / 2 + HEADER_MARGIN_TOP)),
		scaleX,
		scaleY,
		degreesToRadians(rotation),
		x,
		y,
	);

	const inputCenter = efficientAffineTransformation(
		0,
		-(
			height / 2 -
			(inputHeight / 2 +
				HEADER_MARGIN_TOP +
				HEADER_HEIGHT +
				HEADER_MARGIN_BOTTOM)
		),
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
				width={width}
				height={height}
				minWidth={minWidth}
				minHeight={minHeight}
				stroke={BORDER_COLOR}
				strokeWidth={BORDER_WIDTH}
				fill={BACKGROUND_COLOR}
				cornerRadius={CORNER_RADIUS}
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
					showConnectPoints={false}
					connectEnabled={false}
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
			<NodeHeader
				{...nodeHeaderState}
				x={headerCenter.x}
				y={headerCenter.y}
				width={width - BASE_MARGIN * 2}
				height={HEADER_HEIGHT}
				scaleX={scaleX}
				scaleY={scaleY}
				rotation={rotation}
				isSelected={isSelected}
				isAncestorSelected={isAncestorSelected}
				icon={<TextArea fill="#ffffff" />}
				iconBackgroundColor={ICON_COLOR}
				onDrag={handleDrag}
				onSelect={handleSelect}
				onClick={handleClick}
				onHoverChange={handleHoverChange}
				onTextChange={onTextChange}
			/>
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
				isAncestorSelected={isAncestorSelected}
				showOutline={false}
				isTransforming={false}
				showTransformControls={false}
				onDrag={handleDrag}
				onSelect={handleSelect}
				onClick={handleClick}
				onTextChange={onTextChange}
			/>
		</>
	);
};

export const TextAreaNode = memo(TextAreaNodeComponent);
