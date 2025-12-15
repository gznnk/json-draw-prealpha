import { useMemo } from "react";

import type { EventBus } from "../../../../shared/event-bus/EventBus";
import { LLMClientFactory } from "../../../../shared/llm-client";
import type {
	FunctionCallHandler,
	FunctionCallInfo,
} from "../../../../shared/llm-client/types";
import { OpenAiKeyManager } from "../../../../utils/KeyManager";
import {
	circleShapeToolDefinition,
	useAddCircleShapeTool,
} from "../add_circle_shape";
import {
	rectangleShapeToolDefinition,
	useAddRectangleShapeTool,
} from "../add_rectangle_shape";
import {
	textElementToolDefinition,
	useAddTextElementTool,
} from "../add_text_element";
import { groupShapesToolDefinition, useGroupShapesTool } from "../group_shapes";
// import {
// 	resizeCanvasFrameWithHandlerToolDefinition,
// 	useResizeCanvasFrameWithHandlerTool,
// 	type ResizeCanvasFrameResult,
// } from "../resize_canvas_frame_with_handler";
import WEB_DESIGN_INSTRUCTIONS from "./prompts/instructions.md?raw";

// TODO: 整理
// type ResizeCanvasFrameHandler = (result: ResizeCanvasFrameResult) => void;

export const useWebDesignTool = (eventBus: EventBus): FunctionCallHandler => {
	// 各ツールを取得
	const rectangleShapeTool = useAddRectangleShapeTool(eventBus);
	const circleShapeTool = useAddCircleShapeTool(eventBus);
	const textElementTool = useAddTextElementTool(eventBus);
	const groupShapesTool = useGroupShapesTool(eventBus);
	// const resizeCanvasFrameWithHandlerTool =
	// 	useResizeCanvasFrameWithHandlerTool();

	// handler本体をuseMemoで生成
	return useMemo<FunctionCallHandler>(() => {
		const WEB_DESIGN_TOOLS = [
			rectangleShapeToolDefinition,
			circleShapeToolDefinition,
			textElementToolDefinition,
			groupShapesToolDefinition,
			// resizeCanvasFrameWithHandlerToolDefinition,
		];

		const functionHandlerMap = {
			add_rectangle_shape: rectangleShapeTool,
			add_circle_shape: circleShapeTool,
			add_text_element: textElementTool,
			group_shapes: groupShapesTool,
			// resize_canvas_frame: resizeCanvasFrameWithHandlerTool(
			// 	resizeCanvasFrameHandler,
			// ),
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
	}, [
		rectangleShapeTool,
		circleShapeTool,
		textElementTool,
		groupShapesTool,
		// resizeCanvasFrameWithHandlerTool,
		// resizeCanvasFrameHandler,
	]);
};
