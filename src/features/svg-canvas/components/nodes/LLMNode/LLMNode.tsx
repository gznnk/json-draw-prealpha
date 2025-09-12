// Import React.
import type React from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

// Import other libraries.
import { OpenAI } from "openai";

// Import types.
import type { DiagramClickEvent } from "../../../types/events/DiagramClickEvent";
import type { DiagramDragEvent } from "../../../types/events/DiagramDragEvent";
import type { DiagramHoverChangeEvent } from "../../../types/events/DiagramHoverChangeEvent";
import type { DiagramSelectEvent } from "../../../types/events/DiagramSelectEvent";
import type { ExecutionPropagationEvent } from "../../../types/events/ExecutionPropagationEvent";
import type { LLMNodeProps } from "../../../types/props/nodes/LLMNodeProps";
import type { InputState } from "../../../types/state/elements/InputState";
import type { NodeHeaderState } from "../../../types/state/elements/NodeHeaderState";

// Import components.
import { Frame } from "../../elements/Frame";
import { Input } from "../../elements/Input";
import { NodeHeader } from "../../elements/NodeHeader";

// Import icons.
import { LLM } from "../../icons/LLM";

// Import utils.
import { OpenAiKeyManager } from "../../../../../utils/KeyManager";
import { newEventId } from "../../../utils/core/newEventId";
import { degreesToRadians } from "../../../utils/math/common/degreesToRadians";
import { affineTransformation } from "../../../utils/math/transform/affineTransformation";

// Import constants.
import {
	BASE_MARGIN,
	HEADER_HEIGHT,
	HEADER_MARGIN_TOP,
} from "../../../constants/styling/core/LayoutStyling";
import {
	BACKGROUND_COLOR,
	BORDER_COLOR,
	BORDER_WIDTH,
	CORNER_RADIUS,
	ICON_COLOR_IDLE,
	ICON_COLOR_PROCESSING,
	MIN_HEIGHT,
	MIN_WIDTH,
} from "../../../constants/styling/nodes/LLMNodeStyling";

/**
 * LLMNode component.
 */
const LLMNodeComponent: React.FC<LLMNodeProps> = (props) => {
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
		onDragOver,
		onDragLeave,
		onSelect,
		onClick,
		onHoverChange,
		onTextChange,
		onExecute,
		onDiagramChange,
	} = props;

	const nodeHeaderState = items[0] as NodeHeaderState;
	const inputState = items[1] as InputState;

	const [apiKey, setApiKey] = useState<string>("");
	const [processIdList, setProcessIdList] = useState<string[]>([]);
	const [instructions, setInstructions] = useState<string>(inputState.text);

	// Apply the props.text to the state when the component mounts or when props.text changes.
	useEffect(() => {
		setInstructions(inputState.text);
	}, [inputState.text]);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		id,
		instructions,
		onDrag,
		onSelect,
		onClick,
		onHoverChange,
		onExecute,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	// Load the API key from local storage when the component mounts.
	useEffect(() => {
		const storedApiKey = OpenAiKeyManager.loadKey();
		if (storedApiKey) {
			setApiKey(storedApiKey);
		}
	}, []);

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

	// Handler for executing the LLM with streaming response
	const handleExecution = useCallback(
		async (inputText: string) => {
			if (inputText === "") return;

			const { id, instructions, onExecute } = refBus.current;

			const processId = newEventId();
			setProcessIdList((prev) => [...prev, processId]);

			const openai = new OpenAI({
				apiKey: apiKey,
				dangerouslyAllowBrowser: true,
			});

			try {
				const stream = await openai.responses.create({
					model: "gpt-5",
					instructions,
					input: inputText,
					stream: true,
				});

				let fullOutput = "";
				const eventId = newEventId();

				onExecute?.({
					id,
					eventId,
					eventPhase: "Started",
					data: {
						text: "",
					},
				});

				for await (const event of stream) {
					if (event.type === "response.output_text.delta") {
						const delta = event.delta;
						fullOutput += delta;

						onExecute?.({
							id,
							eventId,
							eventPhase: "InProgress",
							data: {
								text: fullOutput,
							},
						});
					}

					if (event.type === "response.output_text.done") {
						onExecute?.({
							id,
							eventId,
							eventPhase: "Ended",
							data: {
								text: fullOutput,
							},
						});
					}
				}
			} catch (error) {
				console.error("Error fetching data from OpenAI API:", error);
				alert("An error occurred during the API request.");
			}

			setProcessIdList((prev) => prev.filter((id) => id !== processId));
		},
		[apiKey],
	);

	// Handle propagation events from child components
	const onPropagation = useCallback(
		(e: ExecutionPropagationEvent) => {
			if (e.eventPhase === "Ended") {
				// Handle execution
				handleExecution(e.data.text);
			}
		},
		[handleExecution],
	);

	const headerCenter = affineTransformation(
		0,
		-(height / 2 - (HEADER_HEIGHT / 2 + HEADER_MARGIN_TOP)),
		scaleX,
		scaleY,
		degreesToRadians(rotation),
		x,
		y,
	);

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
			/>
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
				icon={<LLM fill="#ffffff" />}
				iconBackgroundColor={
					processIdList.length > 0 ? ICON_COLOR_PROCESSING : ICON_COLOR_IDLE
				}
				onDrag={handleDrag}
				onSelect={handleSelect}
				onClick={handleClick}
				onHoverChange={handleHoverChange}
				onTextChange={onTextChange}
			/>
			<Input
				{...inputState}
				text={instructions}
				isSelected={isSelected}
				isAncestorSelected={isAncestorSelected}
				showOutline={false}
				isTransforming={false}
				showTransformControls={false}
				connectType="end-only"
				onDrag={handleDrag}
				onDragOver={onDragOver}
				onDragLeave={onDragLeave}
				onSelect={handleSelect}
				onClick={handleClick}
				onTextChange={onTextChange}
				onDiagramChange={onDiagramChange}
			/>
		</>
	);
};

export const LLMNode = memo(LLMNodeComponent);
