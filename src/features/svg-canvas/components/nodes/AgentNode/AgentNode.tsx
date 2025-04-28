// Import React.
import type React from "react";
import { memo, useEffect, useState, useRef } from "react";

// Import other libraries.
import { OpenAI } from "openai";

// Import types related to SvgCanvas.
import type {
	ConnectNodesEvent,
	ExecuteEvent,
	NewItemEvent,
} from "../../../types/EventTypes";

// Import components related to SvgCanvas.
import { Rectangle, type RectangleProps } from "../../shapes/Rectangle";
import { IconContainer } from "../../core/IconContainer";

// Import hooks related to SvgCanvas.
import { useExecutionChain } from "../../../hooks/useExecutionChain";

// Import functions related to SvgCanvas.
import { newEventId } from "../../../utils/Util";

// Import utilities.
import { OpenAiKeyManager } from "../../../../../utils/KeyManager";

// Import related to this component.
import { RectangleWrapper } from "./AgentNodeStyled";
import { Agent } from "../../icons/Agent";
import { createLLMNodeData } from "../LLMNode";
import { AI_AGENT_TOOLS, AI_AGENT_INSTRUCTIONS } from "./AgentConstants";
import { createTextAreaNodeData } from "../TextAreaNode";

/**
 * Props for the AgentNode component.
 */
// TODO: CreateDiagramPropsで生成
type AgentProps = RectangleProps & {
	onExecute: (e: ExecuteEvent) => void;
	onNewItem: (e: NewItemEvent) => void;
	onConnectNodes: (e: ConnectNodesEvent) => void;
};

/**
 * AgentNode component.
 */
const AgentNodeComponent: React.FC<AgentProps> = (props) => {
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

			try {
				let currentY = refBus.current.props.y;

				const input = [
					{
						role: "system",
						content: AI_AGENT_INSTRUCTIONS,
					},
					{
						role: "user",
						content: e.data.text,
					},
				] as OpenAI.Responses.ResponseInput;

				let fullOutput = "";

				const eventId = newEventId();

				props.onExecute({
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

							props.onExecute({
								id: props.id,
								eventId,
								eventType: "InProgress",
								data: {
									text: fullOutput,
								},
							});
						}

						if (event.type === "response.output_text.done") {
							props.onExecute({
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
								currentY += 250; // Move down by 100 pixels for the new node
								const llmNode = createLLMNodeData({
									x: refBus.current.props.x,
									y: currentY,
									text: functionCallArguments.instructions,
								});
								props.onNewItem({
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
									}),
								});
							}
							if (functionName === "add_text_node") {
								currentY += 250; // Move down by 100 pixels for the new node
								const textNode = createTextAreaNodeData({
									x: refBus.current.props.x,
									y: currentY,
								});
								props.onNewItem({
									item: textNode,
								});
								input.push(event.item);
								input.push({
									type: "function_call_output",
									call_id: event.item.call_id,
									output: JSON.stringify({
										id: textNode.id,
										type: "TextNode",
									}),
								});
							}
							if (functionName === "connect_nodes") {
								const sourceNodeId = functionCallArguments.sourceNodeId;
								const targetNodeId = functionCallArguments.targetNodeId;
								props.onConnectNodes({
									eventId: newEventId(),
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
			{!props.isTextEditing && (
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
			)}
			<RectangleWrapper visible={props.isTextEditing}>
				<Rectangle {...props} />
			</RectangleWrapper>
		</>
	);
};

export const AgentNode = memo(AgentNodeComponent);
