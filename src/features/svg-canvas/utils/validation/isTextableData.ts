// Import types.
import type { TextableData } from "../../types/data/core/TextableData";

/**
 * Check if an object is TextableData.
 *
 * @param obj - The object to check
 * @returns True if the object is TextableData, false otherwise
 */
export const isTextableData = (obj: unknown): obj is TextableData => {
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
		typeof (obj as TextableData).text === "string" &&
		typeof (obj as TextableData).fontColor === "string" &&
		typeof (obj as TextableData).fontSize === "number" &&
		typeof (obj as TextableData).fontFamily === "string" &&
		typeof (obj as TextableData).fontWeight === "string" &&
		typeof (obj as TextableData).isTextEditing === "boolean"
	);
};
