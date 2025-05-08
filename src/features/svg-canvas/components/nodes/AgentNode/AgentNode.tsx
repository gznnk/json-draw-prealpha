// Import React.
import type React from "react";
import { memo, useContext, useEffect, useRef, useState } from "react";

// Import other libraries.
import { OpenAI } from "openai";

// Import components related to SvgCanvas.
import { SvgCanvasContext } from "../../../canvas";
import { IconContainer } from "../../core/IconContainer";
import { Agent } from "../../icons/Agent";
import { DEFAULT_RECTANGLE_DATA, Rectangle } from "../../shapes/Rectangle";

// Import hooks related to SvgCanvas.
import { useExecutionChain } from "../../../hooks/useExecutionChain";

// Import functions related to SvgCanvas.
import { dispatchNewItemEvent } from "../../../canvas/observers/addNewItem";
import { dispatchConnectNodesEvent } from "../../../canvas/observers/connectNodes";
import { newEventId } from "../../../utils";
import { createImageGenNodeData } from "../ImageGenNode";
import { createLLMNodeData } from "../LLMNode";
import { createSvgToDiagramNodeData } from "../SvgToDiagramNode";
import { createTextAreaNodeData } from "../TextAreaNode";

// Import utilities.
import { OpenAiKeyManager } from "../../../../../utils/KeyManager";

// Import related to this component.
import { AI_AGENT_INSTRUCTIONS, AI_AGENT_TOOLS } from "./AgentConstants";
import type { AgentNodeProps } from "./AgentNodeTypes";

/**
 * AgentNode component.
 */
const AgentNodeComponent: React.FC<AgentNodeProps> = (props) => {
	const [apiKey, setApiKey] = useState<string>("");
	const [processIdList, setProcessIdList] = useState<string[]>([]);

	// SvgCanvas state provider.
	const canvasStateProvider = useContext(SvgCanvasContext);

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

	// Handle execution events for the Agent node.
	useExecutionChain({
		id: props.id,
		onPropagation: async (e) => {
			if (e.data.text === "") return;
			if (e.eventType !== "Instant" && e.eventType !== "End") return;

			const processId = newEventId();
			setProcessIdList((prev) => [...prev, processId]);

			const openai = new OpenAI({
				apiKey: apiKey,
				dangerouslyAllowBrowser: true, // ブラウザで直接使用する場合に必要
			});

			// Initialize the input for the OpenAI API.
			const input = [
				{
					role: "system",
					content: AI_AGENT_INSTRUCTIONS,
				},
			] as OpenAI.Responses.ResponseInput;

			// Add the input to the first node position.
			const canvasState = canvasStateProvider?.state();
			if (canvasState) {
				const startX = canvasState.minX + canvasState.scrollLeft + 300;
				const startY =
					canvasState.minY + canvasState.scrollTop + window.innerHeight / 2;

				input.push({
					role: "user",
					content: `Start placing the first node near (X: ${startX}, Y: ${startY}) on the canvas.`,
				});
			}

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
					eventType: "Start",
					data: {
						text: "",
					},
				});

				let count = 0;
				while (count < 10) {
					const stream = await openai.responses.create({
						model: "gpt-4o",
						input,
						stream: true, // 必須！
						tools: AI_AGENT_TOOLS,
					});

					let foundFunctionCall = false;

					for await (const event of stream) {
						console.log(event);

						if (event.type === "response.output_text.delta") {
							const delta = event.delta;
							fullOutput += delta;

							props.onExecute?.({
								id: props.id,
								eventId,
								eventType: "InProgress",
								data: {
									text: fullOutput,
								},
							});
						}

						if (event.type === "response.output_text.done") {
							props.onExecute?.({
								id: props.id,
								eventId,
								eventType: "End",
								data: {
									text: fullOutput,
								},
							});
						}

						if (
							event.type === "response.output_item.done" &&
							event.item?.type === "function_call"
						) {
							foundFunctionCall = true;
							const functionName = event.item.name;
							const functionCallArguments = JSON.parse(event.item.arguments);
							if (functionName === "add_llm_node") {
								const llmNode = createLLMNodeData({
									x: functionCallArguments.x,
									y: functionCallArguments.y,
									text: functionCallArguments.instructions,
								});
								dispatchNewItemEvent({
									eventId,
									item: llmNode,
								});
								input.push(event.item);
								input.push({
									type: "function_call_output",
									call_id: event.item.call_id,
									output: JSON.stringify({
										id: llmNode.id,
										type: "LLMNode",
										instructions: functionCallArguments.instructions,
										width: llmNode.width,
										height: llmNode.height,
									}),
								});
							}
							if (functionName === "add_text_node") {
								const textNode = createTextAreaNodeData({
									x: functionCallArguments.x,
									y: functionCallArguments.y,
								});
								dispatchNewItemEvent({
									eventId,
									item: textNode,
								});
								input.push(event.item);
								input.push({
									type: "function_call_output",
									call_id: event.item.call_id,
									output: JSON.stringify({
										id: textNode.id,
										type: "TextNode",
										width: textNode.width,
										height: textNode.height,
									}),
								});
							}
							if (functionName === "add_svg_to_canvas_node") {
								const svgNode = createSvgToDiagramNodeData({
									x: functionCallArguments.x,
									y: functionCallArguments.y,
								});
								dispatchNewItemEvent({
									eventId,
									item: svgNode,
								});
								input.push(event.item);
								input.push({
									type: "function_call_output",
									call_id: event.item.call_id,
									output: JSON.stringify({
										id: svgNode.id,
										type: "SvgToDiagramNode",
										width: svgNode.width,
										height: svgNode.height,
									}),
								});
							}
							if (functionName === "add_image_gen_node") {
								const node = createImageGenNodeData({
									x: functionCallArguments.x,
									y: functionCallArguments.y,
								});
								dispatchNewItemEvent({
									eventId,
									item: node,
								});
								input.push(event.item);
								input.push({
									type: "function_call_output",
									call_id: event.item.call_id,
									output: JSON.stringify({
										id: node.id,
										type: "SvgToDiagramNode",
										width: node.width,
										height: node.height,
									}),
								});
							}
							if (functionName === "connect_nodes") {
								const sourceNodeId = functionCallArguments.sourceNodeId;
								const targetNodeId = functionCallArguments.targetNodeId;
								dispatchConnectNodesEvent({
									eventId,
									sourceNodeId,
									targetNodeId,
								});

								input.push(event.item);
								input.push({
									type: "function_call_output",
									call_id: event.item.call_id,
									output: JSON.stringify({
										sourceNodeId,
										targetNodeId,
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
				alert("APIリクエスト中にエラーが発生しました。");
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
				<Agent
					width={props.width}
					height={props.height}
					animation={processIdList.length !== 0}
				/>
			</IconContainer>
			<Rectangle
				{...DEFAULT_RECTANGLE_DATA}
				{...props}
				isTransparent
				isTextEditing={false}
				isTextEditEnabled={false}
			/>
		</>
	);
};

export const AgentNode = memo(AgentNodeComponent);
