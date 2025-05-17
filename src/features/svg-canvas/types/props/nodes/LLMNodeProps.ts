// Import types related to SvgCanvas.
import type { CreateDiagramProps } from "../core/CreateDiagramProps";
import type { LLMNodeData } from "../../data/nodes/LLMNodeData";

/**
 * Type of the LLM node component props.
 */
export type LLMNodeProps = CreateDiagramProps<
	LLMNodeData,
	{
		selectable: true;
		transformative: true;
		connectable: true;
		executable: true;
		itemCreatable: true;
	}
> & {
	text: string;
	isTextEditing: boolean;
};
