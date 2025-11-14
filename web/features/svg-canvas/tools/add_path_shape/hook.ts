import { useCallback } from "react";

import type { EventBus } from "../../../../shared/event-bus/EventBus";
import type {
	FunctionCallHandler,
	FunctionCallInfo,
} from "../../../../shared/llm-client/types";
import { useAddDiagramWithBus } from "../../hooks/useAddDiagramWithBus";
import type { Point } from "../../types/core/Point";
import { createPathState } from "../../utils/shapes/path/createPathState";

export const useAddPathShapeTool = (
	eventBus: EventBus,
): FunctionCallHandler => {
	const addDiagram = useAddDiagramWithBus(eventBus);
	return useCallback(
		(functionCall: FunctionCallInfo) => {
			const args = functionCall.arguments as {
				x: number;
				y: number;
				points?: Point[];
				stroke?: string;
				strokeWidth?: number;
			};
			if (typeof args.x === "number" && typeof args.y === "number") {
				const data = createPathState({
					x: args.x,
					y: args.y,
					items: args.points,
					stroke: args.stroke,
					strokeWidth: args.strokeWidth,
				});
				addDiagram(data);
				return {
					id: data.id,
					type: "Path",
					pointCount: data.items.length,
					stroke: data.stroke,
					strokeWidth: data.strokeWidth,
					width: data.width,
					height: data.height,
				};
			}
			return null;
		},
		[addDiagram],
	);
};
