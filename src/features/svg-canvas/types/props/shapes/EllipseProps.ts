// Import types related to SvgCanvas.
import type { CreateDiagramProps } from "../core/CreateDiagramProps";
import type { EllipseData } from "../../data/shapes/EllipseData";

/**
 * Props for Ellipse component
 */
export type EllipseProps = CreateDiagramProps<
	EllipseData,
	{
		selectable: true;
		transformative: true;
		connectable: true;
		textable: true;
	}
>;
