// Import types related to SvgCanvas.
import type {
	CreateDiagramProps,
	CreateDiagramType,
} from "../../../types/DiagramTypes";

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
