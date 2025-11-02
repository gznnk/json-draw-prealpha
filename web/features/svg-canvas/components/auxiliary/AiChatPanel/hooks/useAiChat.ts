import { useCallback, useEffect, useMemo, useState } from "react";

import {
	LLMClientFactory,
	type LLMClient,
} from "../../../../../../shared/llm-client";
import { OpenAiKeyManager } from "../../../../../../utils/KeyManager";
import type { Message } from "../../../../../llm-chat-ui/types";
import { useEventBus } from "../../../../context/EventBusContext";
import {
	circleShapeToolDefinition,
	useAddCircleShapeTool,
} from "../../../../tools/add_circle_shape";
import {
	markdownShapeToolDefinition,
	useAddMarkdownShapeTool,
} from "../../../../tools/add_markdown_shape";
import {
	rectangleShapeToolDefinition,
	useAddRectangleShapeTool,
} from "../../../../tools/add_rectangle_shape";
import {
	textElementToolDefinition,
	useAddTextElementTool,
} from "../../../../tools/add_text_element";
import { connectNodesToolDefinition } from "../../../../tools/connect_nodes/definition";
import { useConnectNodesTool } from "../../../../tools/connect_nodes/hook";
import {
	selectedShapesToolDefinition,
	useGetSelectedShapesTool,
} from "../../../../tools/get_selected_shapes";
import {
	shapesInfoToolDefinition,
	useGetShapesInfoTool,
} from "../../../../tools/get_shapes_info";
import {
	groupShapesToolDefinition,
	useGroupShapesTool,
} from "../../../../tools/group_shapes";
import {
	updateDiagramToolDefinition,
	useUpdateDiagramTool,
} from "../../../../tools/update_diagram";

/**
 * Custom hook for managing AI chat functionality using llm-client.
 * Handles LLM client initialization, message management, streaming responses, and canvas tools.
 *
 * @returns Object containing chat state and handlers
 */
export const useAiChat = () => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [apiKey, setApiKey] = useState<string>("");
	const [llmClient, setLlmClient] = useState<LLMClient | null>(null);
	const eventBus = useEventBus();

	// Initialize tool hooks
	const addRectangleShape = useAddRectangleShapeTool(eventBus);
	const addCircleShape = useAddCircleShapeTool(eventBus);
	const addTextElement = useAddTextElementTool(eventBus);
	const connectNodes = useConnectNodesTool(eventBus);
	const groupShapes = useGroupShapesTool(eventBus);
	const addMarkdownShape = useAddMarkdownShapeTool(eventBus);
	const getShapesInfo = useGetShapesInfoTool(eventBus);
	const getSelectedShapes = useGetSelectedShapesTool(eventBus);
	const updateDiagram = useUpdateDiagramTool();

	// Memoize tool definitions and handlers
	const toolsConfig = useMemo(
		() => ({
			tools: [
				rectangleShapeToolDefinition,
				circleShapeToolDefinition,
				textElementToolDefinition,
				connectNodesToolDefinition,
				groupShapesToolDefinition,
				markdownShapeToolDefinition,
				shapesInfoToolDefinition,
				selectedShapesToolDefinition,
				updateDiagramToolDefinition,
			],
			handlers: {
				add_rectangle_shape: addRectangleShape,
				add_circle_shape: addCircleShape,
				add_text_element: addTextElement,
				connect_nodes: connectNodes,
				group_shapes: groupShapes,
				add_markdown_shape: addMarkdownShape,
				get_shapes_info: getShapesInfo,
				get_selected_shapes: getSelectedShapes,
				update_diagram: updateDiagram,
			},
		}),
		[
			addRectangleShape,
			addCircleShape,
			addTextElement,
			connectNodes,
			groupShapes,
			addMarkdownShape,
			getShapesInfo,
			getSelectedShapes,
			updateDiagram,
		],
	);

	// Load API key on mount
	useEffect(() => {
		const storedApiKey = OpenAiKeyManager.loadKey();
		if (storedApiKey) {
			setApiKey(storedApiKey);
		}
	}, []);

	// Initialize LLM client when API key or tools change
	useEffect(() => {
		if (apiKey) {
			const client = LLMClientFactory.createClient(apiKey, {
				systemPrompt:
					"You are a helpful AI assistant with access to canvas manipulation tools. You can add shapes (rectangles and circles), add text elements, add markdown-enabled text boxes, connect nodes, group shapes together, retrieve information about existing shapes on the canvas, get detailed information about selected shapes, and update properties of existing diagrams. When users ask you to create or modify canvas elements, use the appropriate tools to help them. Use the update_diagram tool to modify existing shapes' properties such as position, size, colors, text, and other visual attributes.",
				tools: toolsConfig.tools,
				functionHandlers: toolsConfig.handlers,
			});
			setLlmClient(client);
		}
	}, [apiKey, toolsConfig]);

	/**
	 * Send a message to the AI and handle streaming response
	 */
	const sendMessage = useCallback(
		async (messageContent: string) => {
			if (!messageContent.trim() || !llmClient || isLoading) {
				return;
			}

			// Add user message
			const userMessage: Message = {
				content: messageContent,
				role: "user",
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, userMessage]);

			// Start loading
			setIsLoading(true);

			try {
				let fullResponse = "";

				// Create assistant message placeholder
				const assistantMessage: Message = {
					content: "",
					role: "assistant",
					timestamp: new Date(),
				};
				setMessages((prev) => [...prev, assistantMessage]);

				// Use LLM client's chat method with streaming
				await llmClient.chat({
					message: messageContent,
					onTextChunk: (textChunk: string) => {
						fullResponse += textChunk;

						// Update the last message (assistant's response) with accumulated text
						setMessages((prev) => {
							const newMessages = [...prev];
							if (newMessages.length > 0) {
								const lastMessage = newMessages[newMessages.length - 1];
								if (lastMessage.role === "assistant") {
									lastMessage.content = fullResponse;
								}
							}
							return newMessages;
						});
					},
				});
			} catch (error) {
				console.error("Error sending message to AI:", error);

				// Add error message
				const errorMessage: Message = {
					content: `Error: ${error instanceof Error ? error.message : "Failed to get response from AI"}`,
					role: "assistant",
					timestamp: new Date(),
				};
				setMessages((prev) => [...prev, errorMessage]);
			} finally {
				setIsLoading(false);
			}
		},
		[llmClient, isLoading],
	);

	/**
	 * Clear all messages
	 */
	const clearMessages = useCallback(() => {
		setMessages([]);
		llmClient?.clearConversation();
	}, [llmClient]);

	return {
		messages,
		isLoading,
		hasApiKey: !!apiKey,
		sendMessage,
		clearMessages,
	};
};
