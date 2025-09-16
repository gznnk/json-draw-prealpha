// Import React.
import type React from "react";
import { memo, useEffect, useRef, useState } from "react";

// Import other libraries.
import { OpenAI } from "openai";

// Import components related to SvgCanvas.
import { IconContainer } from "../../core/IconContainer";
import { PageDesign } from "../../icons/PageDesign";
import { Rectangle } from "../../shapes/Rectangle";

// Import constants.
import { RectangleDefaultState } from "../../../constants/state/shapes/RectangleDefaultState";

// Import hooks related to SvgCanvas.
import { useExecutionChain } from "../../../hooks/useExecutionChain";

// Import functions related to SvgCanvas.
import { useAddDiagram } from "../../../hooks/useAddDiagram";
import { newEventId } from "../../../utils/core/newEventId";

// Import utilities.
import { OpenAiKeyManager } from "../../../../../utils/KeyManager";

// Import related to this component.
import {
	PAGE_DESIGN_AGENT_INSTRUCTIONS,
	PAGE_DESIGN_TOOLS,
} from "./PageDesignConstants";
import {
	createPageDesignRectangle,
	createPageDesignCircle,
	createPageDesignText,
} from "./PageDesignFrameUtils";
import type { PageDesignNodeProps } from "../../../types/props/nodes/PageDesignNodeProps";

/**
 * PageDesignNode component.
 */
const PageDesignNodeComponent: React.FC<PageDesignNodeProps> = (props) => {
	const addDiagram = useAddDiagram();
	const [apiKey, setApiKey] = useState<string>("");
	const [processIdList, setProcessIdList] = useState<string[]>([]);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
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

	// Handle execution events for the PageDesign node.
	useExecutionChain({
		id: props.id,
		onPropagation: async (e) => {
			if (e.data.text === "") return;
			if (e.eventPhase !== "Ended") return;

			const processId = newEventId();
			setProcessIdList((prev) => [...prev, processId]);
			const openai = new OpenAI({
				apiKey: apiKey,
				dangerouslyAllowBrowser: true, // Required for direct browser usage
			});

			// Initialize the input for the OpenAI API.
			const input = [
				{
					role: "system",
					content: PAGE_DESIGN_AGENT_INSTRUCTIONS,
				},
			] as OpenAI.Responses.ResponseInput;

			try {
				input.push({
					role: "user",
					content: e.data.text,
				});

				let fullOutput = "";

				const eventId = newEventId();

				props.onExecute?.({
					id: props.id,
					eventId,
					eventPhase: "Started",
					data: {
						text: "",
					},
				});

				let count = 0;
				while (count < 1000) {
					const stream = await openai.responses.create({
						model: "gpt-5",
						input,
						stream: true, // Required!
						tools: PAGE_DESIGN_TOOLS,
					});

					let foundFunctionCall = false;

					// 追加：直近の reasoning アイテムを覚えておく
					let lastReasoningItem: OpenAI.Responses.ResponseOutputItem | null =
						null;

					for await (const event of stream) {
						console.log(event);

						if (event.type === "response.output_text.delta") {
							const delta = event.delta;
							fullOutput += delta;

							props.onExecute?.({
								id: props.id,
								eventId,
								eventPhase: "InProgress",
								data: {
									text: fullOutput,
								},
							});
						}

						if (event.type === "response.output_text.done") {
							props.onExecute?.({
								id: props.id,
								eventId,
								eventPhase: "Ended",
								data: {
									text: fullOutput,
								},
							});
						}

						// ★ reasoning を捕捉
						if (
							event.type === "response.output_item.done" &&
							event.item?.type === "reasoning"
						) {
							lastReasoningItem = event.item; // 次の function_call 用に保持
						}

						if (
							event.type === "response.output_item.done" &&
							event.item?.type === "function_call"
						) {
							foundFunctionCall = true;
							const functionName = event.item.name;
							const functionCallArguments = JSON.parse(event.item.arguments);
							// ▼ 次リクエストの input に戻す順序が重要
							// 1) reasoning（必須）
							if (lastReasoningItem) input.push(lastReasoningItem);

							if (functionName === "add_rectangle_shape") {
								const rectangleFrame = createPageDesignRectangle({
									x: functionCallArguments.x,
									y: functionCallArguments.y,
									width: functionCallArguments.width,
									height: functionCallArguments.height,
									fill: functionCallArguments.fill,
									stroke: functionCallArguments.stroke || "transparent",
									strokeWidth: functionCallArguments.strokeWidth || 1,
									rx: functionCallArguments.rx || 0,
									text: functionCallArguments.text || "",
									textAlign: functionCallArguments.textAlign || "center",
									verticalAlign: functionCallArguments.verticalAlign || "center",
									fontColor: functionCallArguments.fontColor || "black",
									fontSize: functionCallArguments.fontSize || 16,
									fontFamily: functionCallArguments.fontFamily || "Segoe UI",
									fontWeight: functionCallArguments.fontWeight || "normal",
								});
								addDiagram(rectangleFrame);
								input.push(event.item);
								input.push({
									type: "function_call_output",
									call_id: event.item.call_id,
									output: JSON.stringify({
										id: rectangleFrame.id,
										type: "Rectangle",
										width: rectangleFrame.width,
										height: rectangleFrame.height,
									}),
								});
							}

							if (functionName === "add_circle_shape") {
								const circleFrame = createPageDesignCircle({
									cx: functionCallArguments.cx,
									cy: functionCallArguments.cy,
									r: functionCallArguments.r,
									fill: functionCallArguments.fill,
									stroke: functionCallArguments.stroke || "transparent",
									strokeWidth: functionCallArguments.strokeWidth || 1,
								});
								addDiagram(circleFrame);
								input.push(event.item);
								input.push({
									type: "function_call_output",
									call_id: event.item.call_id,
									output: JSON.stringify({
										id: circleFrame.id,
										type: "Ellipse",
										width: circleFrame.width,
										height: circleFrame.height,
									}),
								});
							}

							if (functionName === "add_text_element") {
								const textElement = createPageDesignText({
									x: functionCallArguments.x,
									y: functionCallArguments.y,
									width: functionCallArguments.width,
									height: functionCallArguments.height,
									text: functionCallArguments.text,
									fontSize: functionCallArguments.fontSize,
									fill: functionCallArguments.fill,
									fontFamily: functionCallArguments.fontFamily || "Segoe UI",
									textAlign: functionCallArguments.textAlign || "center",
									verticalAlign:
										functionCallArguments.verticalAlign || "center",
								});
								addDiagram(textElement);
								input.push(event.item);
								input.push({
									type: "function_call_output",
									call_id: event.item.call_id,
									output: JSON.stringify({
										id: textElement.id,
										type: "Rectangle",
										width: textElement.width,
										height: textElement.height,
										text: functionCallArguments.text,
									}),
								});
							}
						}
					}

					count++;

					if (!foundFunctionCall) {
						break;
					}

					console.log("Function call found, continuing to next iteration.");
				}
			} catch (error) {
				console.error("Error fetching data from OpenAI API:", error);
				alert("An error occurred during the API request.");
			}

			setProcessIdList((prev) => prev.filter((id) => id !== processId));
		},
	});

	return (
		<>
			<IconContainer
				x={props.x}
				y={props.y}
				width={props.width}
				height={props.height}
				rotation={props.rotation}
				scaleX={props.scaleX}
				scaleY={props.scaleY}
			>
				<PageDesign
					width={props.width}
					height={props.height}
					animation={processIdList.length !== 0}
				/>
			</IconContainer>
			<Rectangle
				{...RectangleDefaultState}
				{...props}
				isTransparent
				isTextEditing={false}
				isTextEditEnabled={false}
			/>
		</>
	);
};

export const PageDesignNode = memo(PageDesignNodeComponent);
