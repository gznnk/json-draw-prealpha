import { useCallback } from "react";
import type { EventBus } from "../../../../shared/event-bus/EventBus";
import type {
	FunctionCallHandler,
	FunctionCallInfo,
} from "../../../../shared/llm-client/types";
import { useAddDiagramWithBus } from "../../hooks/useAddDiagramWithBus";
import { createRectangleState } from "../../utils/shapes/rectangle/createRectangleState";

export const useAddTextElementTool = (eventBus: EventBus): FunctionCallHandler => {
	const addDiagram = useAddDiagramWithBus(eventBus);
	return useCallback(
		(functionCall: FunctionCallInfo) => {
			const args = functionCall.arguments as {
				x: number;
				y: number;
				width: number;
				height: number;
				text: string;
				fontSize: number;
				fill: string;
				fontFamily?: string;
				textAlign?: "left" | "center" | "right";
				verticalAlign?: "top" | "center" | "bottom";
				name?: string;
				description?: string;
			};
			
			if (
				typeof args.x === "number" &&
				typeof args.y === "number" &&
				typeof args.width === "number" &&
				typeof args.height === "number" &&
				typeof args.text === "string" &&
				typeof args.fontSize === "number" &&
				typeof args.fill === "string"
			) {
				// Convert top-left coordinates to center coordinates
				const centerX = args.x + args.width / 2;
				const centerY = args.y + args.height / 2;

				const data = createRectangleState({
					x: centerX,
					y: centerY,
					width: args.width,
					height: args.height,
					cornerRadius: 0,
					fill: "transparent", // Transparent background for text-only elements
					stroke: "transparent",
					strokeWidth: "0px",
					text: args.text,
					textType: "textarea",
					fontSize: args.fontSize,
					fontFamily: args.fontFamily || "Segoe UI",
					fontColor: args.fill,
					textAlign: args.textAlign || "center",
					verticalAlign: args.verticalAlign || "center",
					connectEnabled: false,
					name: args.name,
					description: args.description,
				});
				
				addDiagram(data);
				return {
					id: data.id,
					type: "Rectangle",
					width: data.width,
					height: data.height,
					text: args.text,
					x: args.x,
					y: args.y,
				};
			}
			return null;
		},
		[addDiagram],
	);
};