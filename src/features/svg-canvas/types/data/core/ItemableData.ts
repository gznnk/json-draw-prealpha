import type { DiagramData } from "../catalog/DiagramData";

/**
 * Interface for diagram elements that can contain child elements.
 * Used for composite elements like groups that can hold other diagrams.
 */
export type ItemableData = {
	items: DiagramData[];
};
