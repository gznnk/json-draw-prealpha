// Import types related to SvgCanvas.
import type { CreateDiagramProps } from "../../../types/props/CreateDiagramProps";
import type { CreateDataType } from "../../../types/data";

/**
 * Type of the ImageGenNode data.
 */
export type ImageGenNodeData = CreateDataType<{
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
