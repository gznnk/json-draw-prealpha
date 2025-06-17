// Import types.
import type { CreateDiagramProps } from "../core/CreateDiagramProps";
import type { RectangleData } from "../../data/shapes/RectangleData";

/**
 * Props for Rectangle component
 */
export type RectangleProps = CreateDiagramProps<
	RectangleData,
	{
		selectable: true;
		transformative: true;
		connectable: true;
		textable: true;
		fileDroppable: true;
	}
>;
