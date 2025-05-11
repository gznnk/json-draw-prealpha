// Import types related to SvgCanvas.
import type { CreateDiagramProps } from "../../../types/props/CreateDiagramProps";
import type { CreateDataType } from "../../../types/data";

/**
 * Type of the VectorStoreNode data.
 */
export type VectorStoreNodeData = CreateDataType<{
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
