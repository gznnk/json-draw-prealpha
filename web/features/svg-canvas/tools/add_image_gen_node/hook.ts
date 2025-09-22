import { useCallback } from "react";

import type { EventBus } from "../../../../shared/event-bus/EventBus";
import type {
	FunctionCallHandler,
	FunctionCallInfo,
} from "../../../../shared/llm-client/types";
import { useAddDiagramWithBus } from "../../hooks/useAddDiagramWithBus";
import { createImageGenNodeState } from "../../utils/nodes/imageGenNode/createImageGenNodeState";

export const useAddImageGenNodeTool = (
	eventBus: EventBus,
): FunctionCallHandler => {
	const addDiagram = useAddDiagramWithBus(eventBus);
	return useCallback(
		(functionCall: FunctionCallInfo) => {
			const args = functionCall.arguments as { x: number; y: number };
			if (typeof args.x === "number" && typeof args.y === "number") {
				const data = createImageGenNodeState({ x: args.x, y: args.y });
				addDiagram(data);
				return {
					id: data.id,
					type: "ImageGenNode",
					width: data.width,
					height: data.height,
				};
			}
			return null;
		},
		[addDiagram],
	);
};
