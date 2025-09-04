// Import React.
import type React from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

// Import other libraries.
import { OpenAI } from "openai";

// Import types.
import type { DiagramDragEvent } from "../../../types/events/DiagramDragEvent";
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

// Import local modules.
import {
	BASE_MARGIN,
	HEADER_HEIGHT,
	HEADER_MARGIN_BOTTOM,
	HEADER_MARGIN_TOP,
	INPUT_MARGIN_BOTTOM,
} from "./LLMNodeConstants";

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
		onDrag,
		onSelect,
		onTextChange,
		onExecute,
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
					model: "gpt-4o",
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

	const inputHeight =
		height -
		(HEADER_MARGIN_TOP +
			HEADER_HEIGHT +
			HEADER_MARGIN_BOTTOM +
			INPUT_MARGIN_BOTTOM);

	const headerCenter = affineTransformation(
		0,
		-(height / 2 - (HEADER_HEIGHT / 2 + HEADER_MARGIN_TOP)),
		scaleX,
		scaleY,
		degreesToRadians(rotation),
		x,
		y,
	);

	const inputCenter = affineTransformation(
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

	return (
		<>
			<Frame
				{...props}
				minWidth={200}
				minHeight={200}
				stroke="#E5E6EB"
				strokeWidth="1px"
				fill="white"
				cornerRadius={6}
				onPropagation={onPropagation}
			>
				{null}
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
				isAncestorSelected={isSelected}
				icon={<LLM fill="#ffffff" />}
				iconBackgroundColor={processIdList.length > 0 ? "#10B981" : "#8B5CF6"}
				onDrag={handleDrag}
				onSelect={handleSelect}
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
				text={instructions}
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

export const LLMNode = memo(LLMNodeComponent);
