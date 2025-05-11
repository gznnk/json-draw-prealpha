import type { Diagram } from "../../catalog/DiagramTypes"; // Imported from catalog instead of types

/**
 * Interface for diagram elements that can contain child elements.
 * Used for composite elements like groups that can hold other diagrams.
 */
export type ItemableData = {
	items: Diagram[];
};
