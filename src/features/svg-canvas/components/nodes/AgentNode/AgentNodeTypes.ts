// Import types related to SvgCanvas.
import type { CreateDiagramProps } from "../../../types/props/CreateDiagramProps";
import type { CreateDataType } from "../../../types/data";

/**
 * Type of the AgentNode data.
 */
export type AgentNodeData = CreateDataType<{
	selectable: true;
	transformative: true;
	connectable: true;
}>;

/**
 * Type of the AgentNode component props.
 */
export type AgentNodeProps = CreateDiagramProps<
	AgentNodeData,
	{
		selectable: true;
		transformative: true;
		connectable: true;
		executable: true;
		itemCreatable: true;
	}
>;
