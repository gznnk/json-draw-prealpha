// Import React.
import type React from "react";
import { memo, useEffect, useState, useRef } from "react";

// Import other libraries.
import { OpenAI } from "openai";

// Import types related to SvgCanvas.
import type { ExecuteEvent, NewItemEvent } from "../../../types/EventTypes";

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
						role: "user",
						content: e.data.text,
					},
				] as OpenAI.Responses.ResponseInput;

				const stream = await openai.responses.create({
					model: "gpt-4o",
					instructions: AI_AGENT_INSTRUCTIONS,
					input,
					stream: true, // 必須！
					tools: AI_AGENT_TOOLS,
				});

				for await (const event of stream) {
					console.log(event);
					if (
						event.type === "response.output_item.done" &&
						event.item?.type === "function_call"
					) {
						const functionName = event.item.name;
						const functionCallArguments = JSON.parse(event.item.arguments);
						if (functionName === "add_llm_node") {
							currentY += 200; // Move down by 100 pixels for the new node
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
								output: llmNode.id,
							});
						}
						if (functionName === "add_text_node") {
							currentY += 200; // Move down by 100 pixels for the new node
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
								output: textNode.id,
							});
						}
					}
				}

				console.log("--------------------");

				const stream2 = await openai.responses.create({
					model: "gpt-4o",
					instructions: AI_AGENT_INSTRUCTIONS,
					input,
					stream: true, // 必須！
					tools: AI_AGENT_TOOLS,
				});
				for await (const event of stream2) {
					console.log(event);
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
					iconWidth={80}
					iconHeight={80}
				>
					<Agent width={80} height={80} animate={processIdList.length !== 0} />
				</IconContainer>
			)}
			<RectangleWrapper visible={props.isTextEditing}>
				<Rectangle {...props} />
			</RectangleWrapper>
		</>
	);
};

export const AgentNode = memo(AgentNodeComponent);
