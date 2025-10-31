import { useMemo } from "react";

import type { EventBus } from "../../../../shared/event-bus/EventBus";
import type { FunctionCallHandler } from "../../../../shared/llm-client/types";
import { useAddDiagramWithBus } from "../../hooks/useAddDiagramWithBus";
import { useAddMarkdownShapeWithHandlerTool } from "../add_markdown_shape_with_handler";

export const useAddMarkdownShapeTool = (
	eventBus: EventBus,
): FunctionCallHandler => {
	const addDiagram = useAddDiagramWithBus(eventBus);
	const markdownShapeWithHandlerTool = useAddMarkdownShapeWithHandlerTool();

	return useMemo(
		() => markdownShapeWithHandlerTool(addDiagram),
		[addDiagram, markdownShapeWithHandlerTool],
	);
};
