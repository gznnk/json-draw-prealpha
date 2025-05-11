import type { CreateDiagramType } from "./CreateDiagramType";

/**
 * Type for the data of the Image component.
 */
export type ImageData = CreateDiagramType<{
	selectable: true;
	transformative: true;
}> & {
	base64Data: string;
};
