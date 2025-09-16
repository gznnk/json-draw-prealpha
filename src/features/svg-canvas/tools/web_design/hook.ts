import { useMemo } from "react";
import type { EventBus } from "../../../../shared/event-bus/EventBus";
import type {
	FunctionCallHandler,
	FunctionCallInfo,
} from "../../../../shared/llm-client/types";

// Import tool definitions and handlers
import { rectangleShapeToolDefinition } from "../add_rectangle_shape";
import { circleShapeToolDefinition } from "../add_circle_shape";
import { textElementToolDefinition } from "../add_text_element";
import { groupShapesToolDefinition } from "../group_shapes";

// Import web design specific descriptions
import { ADD_RECTANGLE_SHAPE_DESCRIPTION } from "./prompts/add-rectangle-description";
import { ADD_CIRCLE_SHAPE_DESCRIPTION } from "./prompts/add-circle-description";
import { ADD_TEXT_ELEMENT_DESCRIPTION } from "./prompts/add-text-description";
import { GROUP_SHAPES_DESCRIPTION } from "./prompts/group-shapes-description";

import { useAddRectangleShapeTool } from "../add_rectangle_shape";
import { useAddCircleShapeTool } from "../add_circle_shape";
import { useAddTextElementTool } from "../add_text_element";
import { useGroupShapesTool } from "../group_shapes";

// Import LLM client
import { LLMClientFactory } from "../../../../shared/llm-client";
import { OpenAiKeyManager } from "../../../../utils/KeyManager";

// Import instructions
import { WEB_DESIGN_INSTRUCTIONS } from "./prompts/instructions";

export const useWebDesignTool = (eventBus: EventBus): FunctionCallHandler => {
	// 各ツールのhandlerをhookで生成
	const addRectangleShapeHandler = useAddRectangleShapeTool(eventBus);
	const addCircleShapeHandler = useAddCircleShapeTool(eventBus);
	const addTextElementHandler = useAddTextElementTool(eventBus);
	const groupShapesHandler = useGroupShapesTool(eventBus);

	// handler本体をuseMemoで生成
	return useMemo<FunctionCallHandler>(() => {
		const WEB_DESIGN_TOOLS = [
			{
				...rectangleShapeToolDefinition,
				description: ADD_RECTANGLE_SHAPE_DESCRIPTION,
			},
			{
				...circleShapeToolDefinition,
				description: ADD_CIRCLE_SHAPE_DESCRIPTION,
			},
			{
				...textElementToolDefinition,
				description: ADD_TEXT_ELEMENT_DESCRIPTION,
			},
			{
				...groupShapesToolDefinition,
				description: GROUP_SHAPES_DESCRIPTION,
			},
		];

		const functionHandlerMap = {
			add_rectangle_shape: addRectangleShapeHandler,
			add_circle_shape: addCircleShapeHandler,
			add_text_element: addTextElementHandler,
			group_shapes: groupShapesHandler,
		};

		const handler: FunctionCallHandler = async (
			functionCall: FunctionCallInfo,
		) => {
			const args = functionCall.arguments as { design_request: string };
			if (typeof args.design_request === "string") {
				const storedApiKey = OpenAiKeyManager.loadKey();
				if (!storedApiKey)
					return { success: false, content: "API key not found." };

				let outputContent = "";
				try {
					const llmClient = LLMClientFactory.createClient(storedApiKey, {
						tools: WEB_DESIGN_TOOLS,
						systemPrompt: WEB_DESIGN_INSTRUCTIONS,
						functionHandlers: functionHandlerMap,
						maxAttempts: 500,
					});

					const userMessage = `${args.design_request}\n\nCreate the web page design using the available tools. Start with background elements and work your way up to text elements for proper layering.`;

					await llmClient.chat({
						message: userMessage,
						onTextChunk: (textChunk: string) => {
							outputContent += textChunk;
						},
					});

					return {
						success: true,
						content: outputContent || "Web design creation completed.",
					};
				} catch (error) {
					// eslint-disable-next-line no-console
					console.error("Error in web design agent:", error);
					return {
						success: false,
						content: "Error creating web design.",
					};
				}
			}
			return {
				success: false,
				content: "Invalid arguments: design_request is required.",
			};
		};
		return handler;
	}, [
		addRectangleShapeHandler,
		addCircleShapeHandler,
		addTextElementHandler,
		groupShapesHandler,
	]);
};
