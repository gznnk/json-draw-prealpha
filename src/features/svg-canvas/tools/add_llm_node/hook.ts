import { useCallback } from "react";
import type { EventBus } from "../../../../shared/event-bus/EventBus";
import type {
	FunctionCallHandler,
	FunctionCallInfo,
} from "../../../../shared/llm-client/types";
import { useAddDiagramWithBus } from "../../hooks/useAddDiagramWithBus";
import { createLLMNodeState } from "../../utils/nodes/llmNode/createLLMNodeState";

export const useAddLLMNodeTool = (eventBus: EventBus): FunctionCallHandler => {
	const addDiagram = useAddDiagramWithBus(eventBus);
	return useCallback(
		(functionCall: FunctionCallInfo) => {
			const args = functionCall.arguments as {
				x: number;
				y: number;
				instructions: string;
			};
			if (
				typeof args.x === "number" &&
				typeof args.y === "number" &&
				typeof args.instructions === "string"
			) {
				const data = createLLMNodeState({
					x: args.x,
					y: args.y,
					text: args.instructions,
				});
				addDiagram(data);
				return {
					id: data.id,
					type: "LLMNode",
					instructions: args.instructions,
					width: data.width,
					height: data.height,
				};
			}
			return null;
		},
		[addDiagram],
	);
};
