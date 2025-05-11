// Import types related to SvgCanvas.
import type { CreateDiagramProps } from "../../../types/DiagramTypes";
import type { CreateDiagramType } from "../../../types/shapes";

/**
 * Type of the VectorStoreNode data.
 */
export type VectorStoreNodeData = CreateDiagramType<{
	selectable: true;
	transformative: true;
	connectable: true;
}>;

/**
 * Type of the VectorStoreNode component props.
 */
export type VectorStoreNodeProps = CreateDiagramProps<
	VectorStoreNodeData,
	{
		selectable: true;
		transformative: true;
		connectable: true;
		executable: true;
	}
>;
