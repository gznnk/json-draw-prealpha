import type React from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

import {
	LLMClientFactory,
	type LLMClient,
} from "../../../../../shared/llm-client";
import { OpenAiKeyManager } from "../../../../../utils/KeyManager";
import { useProcessManager } from "../../../hooks/useProcessManager";
import type { DiagramClickEvent } from "../../../types/events/DiagramClickEvent";
import type { DiagramDragEvent } from "../../../types/events/DiagramDragEvent";
import type { DiagramSelectEvent } from "../../../types/events/DiagramSelectEvent";
import type { ExecutionPropagationEvent } from "../../../types/events/ExecutionPropagationEvent";
import type { AiProps } from "../../../types/props/diagrams/AiProps";
import type { InputState } from "../../../types/state/elements/InputState";
import { newEventId } from "../../../utils/core/newEventId";
import { isPlainTextPayload } from "../../../utils/execution/isPlainTextPayload";
import { degreesToRadians } from "../../../utils/math/common/degreesToRadians";
import { efficientAffineTransformation } from "../../../utils/math/transform/efficientAffineTransformation";
import { ProcessIndicator } from "../../auxiliary/ProcessIndicator";
import { Button } from "../../elements/Button";
import { Frame } from "../../elements/Frame";
import { Input } from "../../elements/Input";
import { AiAssistant } from "../../icons/AiAssistant";

/**
 * Ai component - an AI chat diagram element with avatar, speech bubble, and chat input
 */
const AiComponent: React.FC<AiProps> = (props) => {
	const {
		id,
		x,
		y,
		width,
		height,
		scaleX,
		scaleY,
		rotation,
		rotateEnabled,
		avatarUrl,
		avatarBgColor,
		bubbleBgColor,
		aiMessage,
		items,
		isSelected,
		isAncestorSelected,
		onDrag,
		onSelect,
		onClick,
		onHoverChange,
		onTextChange,
		onExecute,
		onAiMessageChange,
	} = props;

	const inputState = items[0] as InputState;
	const [text, setText] = useState<string>(inputState?.text || "");
	const [currentMessage, setCurrentMessage] = useState<string>(aiMessage);
	const [apiKey, setApiKey] = useState<string>("");
	const [llmClient, setLlmClient] = useState<LLMClient | null>(null);

	const { processes, addProcess, setProcessSuccess, setProcessError } =
		useProcessManager();

	useEffect(() => {
		setText(inputState?.text || "");
	}, [inputState?.text]);

	useEffect(() => {
		setCurrentMessage(aiMessage);
	}, [aiMessage]);

	// Load API key and initialize LLM client
	useEffect(() => {
		const storedApiKey = OpenAiKeyManager.loadKey();
		if (storedApiKey) {
			setApiKey(storedApiKey);
			const client = LLMClientFactory.createClient(storedApiKey, {
				systemPrompt: "You are a helpful AI assistant.",
			});
			setLlmClient(client);
		}
	}, []);

	// Update LLM client when API key changes
	useEffect(() => {
		if (apiKey) {
			const client = LLMClientFactory.createClient(apiKey, {
				systemPrompt: "You are a helpful AI assistant.",
			});
			setLlmClient(client);
		}
	}, [apiKey]);

	// Create references to avoid function creation in every render
	const refBusVal = {
		id,
		text,
		onDrag,
		onSelect,
		onClick,
		onHoverChange,
		onTextChange,
		onExecute,
		onAiMessageChange,
		setText,
		setCurrentMessage,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	// Handler for drag events
	const handleDrag = useCallback((e: DiagramDragEvent) => {
		const { id, onDrag } = refBus.current;
		onDrag?.({
			...e,
			id,
		});
	}, []);

	// Handler for select events
	const handleSelect = useCallback((e: DiagramSelectEvent) => {
		const { id, onSelect } = refBus.current;
		onSelect?.({
			...e,
			id,
		});
	}, []);

	// Handler for click events
	const handleClick = useCallback((e: DiagramClickEvent) => {
		const { id, onClick } = refBus.current;
		onClick?.({
			...e,
			id,
		});
	}, []);

	// Handler for executing the LLM with streaming response
	const handleExecution = useCallback(
		async (inputText: string) => {
			if (inputText === "" || !llmClient) return;

			const { id, onExecute, onAiMessageChange, setCurrentMessage } =
				refBus.current;

			const processId = newEventId();
			addProcess(processId);

			try {
				let fullOutput = "";
				const eventId = newEventId();

				onExecute?.({
					id,
					eventId,
					eventPhase: "Started",
					payload: {
						format: "text",
						data: "",
						metadata: {
							contentType: "plain",
						},
					},
				});

				// Use LLMClient's chat method with streaming callback
				await llmClient.chat({
					message: inputText,
					onTextChunk: (textChunk: string) => {
						fullOutput += textChunk;
						setCurrentMessage(fullOutput);

						onExecute?.({
							id,
							eventId,
							eventPhase: "InProgress",
							payload: {
								format: "text",
								data: fullOutput,
								metadata: {
									contentType: "plain",
								},
							},
						});
					},
				});

				// Update the AI message state
				onAiMessageChange?.({
					id,
					eventId,
					eventPhase: "Ended",
					aiMessage: fullOutput,
				});

				// Send completion event
				onExecute?.({
					id,
					eventId,
					eventPhase: "Ended",
					payload: {
						format: "text",
						data: fullOutput,
						metadata: {
							contentType: "plain",
						},
					},
				});

				setProcessSuccess(processId);
			} catch (error) {
				console.error("Error fetching data from LLM API:", error);
				alert("An error occurred during the API request.");
				setProcessError(processId);
			}
		},
		[llmClient, addProcess, setProcessError, setProcessSuccess],
	);

	// Handler for send button click
	const handleSendClick = useCallback(() => {
		const { text } = refBus.current;
		if (text.trim() === "") return;
		handleExecution(text);
	}, [handleExecution]);

	// Handle propagation events from child components
	const onPropagation = useCallback(
		(e: ExecutionPropagationEvent) => {
			if (e.eventPhase === "Ended") {
				if (!isPlainTextPayload(e.payload)) return;
				// Handle execution
				const textData = e.payload.data;
				handleExecution(textData);
			}
		},
		[handleExecution],
	);

	// Layout constants
	const avatarSize = 60;
	const buttonWidth = 60;
	const buttonHeight = 36;
	const bubbleHeight = height - avatarSize - 110; // Space for avatar, input, and padding
	const inputHeight = 40;
	const padding = 0;
	const bubblePadding = 15;

	// Avatar position (top center)
	const avatarY = -(height / 2 - (avatarSize / 2 + padding));

	// Speech bubble position (below avatar)
	const bubbleY = avatarY + avatarSize / 2 + padding + bubbleHeight / 2;

	// Input position (bottom left)
	const inputWidth = width - padding * 2 - buttonWidth - 5; // 5px gap between input and button
	const inputCenter = efficientAffineTransformation(
		-(buttonWidth / 2 + 2.5), // Shift left to make room for button
		height / 2 - (inputHeight / 2 + padding),
		scaleX,
		scaleY,
		degreesToRadians(rotation),
		x,
		y,
	);

	// Send button position (bottom right)
	const buttonCenter = efficientAffineTransformation(
		width / 2 - (buttonWidth / 2 + padding),
		height / 2 - (buttonHeight / 2 + padding + 2), // Align with input vertically
		scaleX,
		scaleY,
		degreesToRadians(rotation),
		x,
		y,
	);

	// Calculate positions for transform
	const left = -width / 2;
	const bubbleTop = bubbleY - bubbleHeight / 2;
	const tailWidth = 20;
	const tailHeight = 15;
	const bubbleWidth = width - padding * 2;

	return (
		<>
			<Frame
				{...props}
				width={width}
				height={height}
				minWidth={250}
				minHeight={350}
				stroke="none"
				strokeWidth="0px"
				fill="transparent"
				cornerRadius={0}
				rotateEnabled={rotateEnabled}
				connectEnabled={false}
				connectPoints={[]}
				showConnectPoints={false}
				onPropagation={onPropagation}
			>
				{/* Avatar circle */}
				<circle
					cx={0}
					cy={avatarY}
					r={avatarSize / 2}
					fill={avatarBgColor}
					pointerEvents="none"
				/>

				{/* Avatar image or icon */}
				{avatarUrl ? (
					<image
						href={avatarUrl}
						x={-avatarSize / 2}
						y={avatarY - avatarSize / 2}
						width={avatarSize}
						height={avatarSize}
						clipPath={`circle(${avatarSize / 2}px at center)`}
						pointerEvents="none"
					/>
				) : (
					<g
						transform={`translate(${-avatarSize / 2}, ${avatarY - avatarSize / 2})`}
					>
						<AiAssistant
							width={avatarSize}
							height={avatarSize}
							animation={true}
						/>
					</g>
				)}

				{/* Speech bubble tail (triangle pointing to avatar) */}
				<polygon
					points={`
						${0},${bubbleTop}
						${-tailWidth / 2},${bubbleTop - tailHeight}
						${tailWidth / 2},${bubbleTop - tailHeight}
					`}
					fill={bubbleBgColor}
					stroke="#ccc"
					strokeWidth="1"
					pointerEvents="none"
				/>

				{/* Main bubble rectangle */}
				<rect
					x={left + padding}
					y={bubbleTop}
					width={bubbleWidth}
					height={bubbleHeight}
					rx="10"
					ry="10"
					fill={bubbleBgColor}
					stroke="#ccc"
					strokeWidth="1"
					pointerEvents="none"
				/>

				{/* Bubble content */}
				<foreignObject
					x={left + padding + bubblePadding}
					y={bubbleTop + bubblePadding}
					width={bubbleWidth - bubblePadding * 2}
					height={bubbleHeight - bubblePadding * 2}
					pointerEvents="none"
				>
					<div
						style={{
							width: "100%",
							height: "100%",
							overflow: "auto",
							fontSize: "14px",
							color: "#333",
							fontFamily: "Arial, sans-serif",
							whiteSpace: "pre-wrap",
							wordWrap: "break-word",
						}}
					>
						{currentMessage}
					</div>
				</foreignObject>
			</Frame>
			<ProcessIndicator
				x={x}
				y={y}
				width={width}
				height={height}
				rotation={rotation}
				processes={processes}
			/>
			{inputState && (
				<Input
					{...inputState}
					x={inputCenter.x}
					y={inputCenter.y}
					width={inputWidth}
					height={inputHeight}
					scaleX={scaleX}
					scaleY={scaleY}
					rotation={rotation}
					text={text}
					isSelected={isSelected}
					isAncestorSelected={isAncestorSelected}
					rotateEnabled={rotateEnabled}
					showOutline={false}
					isTransforming={false}
					showTransformControls={false}
					onDrag={handleDrag}
					onSelect={handleSelect}
					onClick={handleClick}
					onTextChange={onTextChange}
				/>
			)}
			<Button
				id={`${id}-send-button`}
				x={buttonCenter.x}
				y={buttonCenter.y}
				width={buttonWidth}
				height={buttonHeight}
				scaleX={1}
				scaleY={1}
				rotation={0}
				keepProportion={false}
				rotateEnabled={false}
				inversionEnabled={false}
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
				onClick={handleSendClick}
			/>
		</>
	);
};

export const Ai = memo(AiComponent);
