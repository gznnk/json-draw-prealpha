import { definition } from "./definition";
import { handler } from "./handler";

export const newWork = {
	definition: definition,
	handler: handler,
};

// Re-export EventBus for external use
export { newWorkEventBus } from "./handler";
export { useNewWork } from "./hooks";
