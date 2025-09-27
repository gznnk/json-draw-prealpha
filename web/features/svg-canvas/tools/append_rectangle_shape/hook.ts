import { useCallback } from "react";

import type { EventBus } from "../../../../shared/event-bus/EventBus";
import type {
	FunctionCallHandler,
	FunctionCallInfo,
} from "../../../../shared/llm-client/types";
import { useAppendDiagramsWithBus } from "../../hooks/useAppendDiagramsWithBus";
import { createRectangleState } from "../../utils/shapes/rectangle/createRectangleState";

export const useAppendRectangleShapeTool = (
	eventBus: EventBus,
): ((targetId: string) => FunctionCallHandler) => {
	const appendDiagrams = useAppendDiagramsWithBus(eventBus);

	return useCallback(
		(targetId: string) => {
			return (functionCall: FunctionCallInfo) => {
				const args = functionCall.arguments as {
					x: number;
					y: number;
					width: number;
					height: number;
					fill: string;
					stroke?: string;
					strokeWidth?: number;
					rx?: number;
					text?: string;
					textAlign?: "left" | "center" | "right";
					verticalAlign?: "top" | "center" | "bottom";
					fontColor?: string;
					fontSize?: number;
					fontFamily?: string;
					fontWeight?: string;
					name?: string;
					description?: string;
				};

				if (
					typeof args.x === "number" &&
					typeof args.y === "number" &&
					typeof args.width === "number" &&
					typeof args.height === "number" &&
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
						cornerRadius: args.rx || 0,
						fill: args.fill,
						stroke: args.stroke || "transparent",
						strokeWidth: `${args.strokeWidth || 1}px`,
						text: args.text || "",
						textType: "textarea",
						textAlign: args.textAlign || "center",
						verticalAlign: args.verticalAlign || "center",
						fontColor: args.fontColor || "black",
						fontSize: args.fontSize || 16,
						fontFamily: args.fontFamily || "Noto Sans JP",
						fontWeight: args.fontWeight || "normal",
						connectEnabled: false,
						name: args.name,
						description: args.description,
					});

					appendDiagrams(targetId, [data]);
					return {
						id: data.id,
						type: "Rectangle",
						width: data.width,
						height: data.height,
						x: args.x,
						y: args.y,
					};
				}
				return null;
			};
		},
		[appendDiagrams],
	);
};
