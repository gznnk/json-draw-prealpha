// Import ContentType from shared type definitions
import type { ContentType } from "../../types/ContentType";

/**
 * Props for the ContentView component
 */
export type ContentViewProps = {
	/** Type of content */
	type?: ContentType;
	/** Data to display (varies by content type) */
	content?: unknown;
	/** Content ID */
	id?: string;
	/** Callback fired when content changes */
	onChange?: (content: string) => void;
};
