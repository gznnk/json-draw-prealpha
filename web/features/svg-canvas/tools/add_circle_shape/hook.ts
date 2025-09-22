import { useCallback } from "react";

import type { EventBus } from "../../../../shared/event-bus/EventBus";
import type {
	FunctionCallHandler,
	FunctionCallInfo,
} from "../../../../shared/llm-client/types";
import { useAddDiagramWithBus } from "../../hooks/useAddDiagramWithBus";
import { createEllipseState } from "../../utils/shapes/ellipse/createEllipseState";

export const useAddCircleShapeTool = (
	eventBus: EventBus,
): FunctionCallHandler => {
	const addDiagram = useAddDiagramWithBus(eventBus);
	return useCallback(
		(functionCall: FunctionCallInfo) => {
			const args = functionCall.arguments as {
				cx: number;
				cy: number;
				r: number;
				fill: string;
				stroke?: string;
				strokeWidth?: number;
				name?: string;
				description?: string;
			};

			if (
				typeof args.cx === "number" &&
				typeof args.cy === "number" &&
				typeof args.r === "number" &&
				typeof args.fill === "string"
			) {
				const data = createEllipseState({
					x: args.cx,
					y: args.cy,
					width: args.r * 2,
					height: args.r * 2,
					fill: args.fill,
					stroke: args.stroke || "transparent",
					strokeWidth: `${args.strokeWidth || 1}px`,
					text: "",
					textType: "textarea",
					connectEnabled: false,
					name: args.name,
					description: args.description,
				});

				addDiagram(data);
				return {
					id: data.id,
					type: "Ellipse",
					width: data.width,
					height: data.height,
					cx: args.cx,
					cy: args.cy,
					r: args.r,
				};
			}
			return null;
		},
		[addDiagram],
	);
};
