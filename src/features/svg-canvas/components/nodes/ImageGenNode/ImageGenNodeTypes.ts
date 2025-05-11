// Import types related to SvgCanvas.
import type { CreateDiagramProps } from "../../../types/DiagramTypes";
import type { CreateDiagramType } from "../../../types/shapes";

/**
 * Type of the ImageGenNode data.
 */
export type ImageGenNodeData = CreateDiagramType<{
	selectable: true;
	transformative: true;
	connectable: true;
}>;

/**
 * Type of the ImageGenNode component props.
 */
export type ImageGenNodeProps = CreateDiagramProps<
	ImageGenNodeData,
	{
		selectable: true;
		transformative: true;
		connectable: true;
		executable: true;
		itemCreatable: true;
	}
>;
