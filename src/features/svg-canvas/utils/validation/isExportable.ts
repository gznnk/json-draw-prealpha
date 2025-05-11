import { DiagramExportFunctions } from "../../types/DiagramCatalog";
import type { DiagramType } from "../../types/base";

/**
 * Check if an object is exportable.
 *
 * @param obj - The object to check
 * @returns True if the object is exportable, false otherwise
 */
export const isExportable = (obj: unknown): boolean => {
	return (
		obj !== null &&
		typeof obj === "object" &&
		"type" in obj &&
		DiagramExportFunctions[obj.type as DiagramType] !== undefined
	);
};
