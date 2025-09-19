import type { TextableState } from "../../types/state/core/TextableState";

/**
 * Check if an object is TextableState.
 *
 * @param obj - The object to check
 * @returns True if the object is TextableState, false otherwise
 */
export const isTextableState = (obj: unknown): obj is TextableState => {
	return (
		obj !== null &&
		typeof obj === "object" &&
		"text" in obj &&
		"textType" in obj &&
		"textAlign" in obj &&
		"verticalAlign" in obj &&
		"fontColor" in obj &&
		"fontSize" in obj &&
		"fontFamily" in obj &&
		"fontWeight" in obj &&
		"isTextEditing" in obj &&
		typeof (obj as TextableState).text === "string" &&
		typeof (obj as TextableState).fontColor === "string" &&
		typeof (obj as TextableState).fontSize === "number" &&
		typeof (obj as TextableState).fontFamily === "string" &&
		typeof (obj as TextableState).fontWeight === "string" &&
		typeof (obj as TextableState).isTextEditing === "boolean"
	);
};
