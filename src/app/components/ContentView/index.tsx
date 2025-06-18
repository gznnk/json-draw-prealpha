// Export component
export { ContentView } from "./ContentView";

// Export types
export type { ContentViewProps } from "./ContentViewTypes";

// Export constants
export {
	EMPTY_CONTENT_MESSAGE,
	NO_SELECTION_MESSAGE,
} from "./ContentViewConstants";

// Re-export ContentType for compatibility
// Note: importing from "../../types/ContentType" is recommended going forward
export { ContentType } from "../../types/ContentType";
