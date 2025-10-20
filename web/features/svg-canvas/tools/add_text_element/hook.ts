import { useMemo } from "react";

import type { EventBus } from "../../../../shared/event-bus/EventBus";
import type { FunctionCallHandler } from "../../../../shared/llm-client/types";
import { useAddDiagramWithBus } from "../../hooks/useAddDiagramWithBus";
import { useAddTextElementWithHandlerTool } from "../add_text_element_with_handler";

export const useAddTextElementTool = (
	eventBus: EventBus,
): FunctionCallHandler => {
	const addDiagram = useAddDiagramWithBus(eventBus);
	const textElementWithHandlerTool = useAddTextElementWithHandlerTool();

	return useMemo(
		() => textElementWithHandlerTool(addDiagram),
		[addDiagram, textElementWithHandlerTool],
	);
};
