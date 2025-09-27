import { useMemo } from "react";

import type { EventBus } from "../../../../shared/event-bus/EventBus";
import { LLMClientFactory } from "../../../../shared/llm-client";
import type {
	FunctionCallHandler,
	FunctionCallInfo,
} from "../../../../shared/llm-client/types";
import { OpenAiKeyManager } from "../../../../utils/KeyManager";
import {
	appendCircleShapeToolDefinition,
	useAppendCircleShapeTool,
} from "../append_circle_shape";
import {
	appendRectangleShapeToolDefinition,
	useAppendRectangleShapeTool,
} from "../append_rectangle_shape";
import {
	appendTextElementToolDefinition,
	useAppendTextElementTool,
} from "../append_text_element";
import { groupShapesToolDefinition, useGroupShapesTool } from "../group_shapes";
import WEB_DESIGN_INSTRUCTIONS from "./prompts/instructions.md?raw";

export const useWebDesignTool = (eventBus: EventBus): ((targetId: string) => FunctionCallHandler) => {
	// 各ツールのhandlerをhookで生成
	const appendRectangleShapeHandler = useAppendRectangleShapeTool(eventBus);
	const appendCircleShapeHandler = useAppendCircleShapeTool(eventBus);
	const appendTextElementHandler = useAppendTextElementTool(eventBus);
	const groupShapesHandler = useGroupShapesTool(eventBus);

	// handler本体をuseMemoで生成
	return useMemo<(targetId: string) => FunctionCallHandler>(() => {
		return (targetId: string) => {
			const WEB_DESIGN_TOOLS = [
				appendRectangleShapeToolDefinition,
				appendCircleShapeToolDefinition,
				appendTextElementToolDefinition,
				groupShapesToolDefinition,
			];

			const functionHandlerMap = {
				append_rectangle_shape: appendRectangleShapeHandler(targetId),
				append_circle_shape: appendCircleShapeHandler(targetId),
				append_text_element: appendTextElementHandler(targetId),
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
		};
	}, [
		appendRectangleShapeHandler,
		appendCircleShapeHandler,
		appendTextElementHandler,
		groupShapesHandler,
	]);
};
