// Import types related to SvgCanvas.
import type { CreateDiagramProps } from "../core/CreateDiagramProps";
import type { TextAreaNodeData } from "../../data/nodes/TextAreaNodeData";
import type { DiagramChangeEvent } from "../../events/DiagramChangeEvent";

/**
 * Type of the TextAreaNode component props.
 */
export type TextAreaNodeProps = CreateDiagramProps<
	TextAreaNodeData,
	{
		selectable: true;
		transformative: true;
		connectable: true;
		executable: true;
	}
> & {
	text: string;
	isTextEditing: boolean;
	onDiagramChange?: (e: DiagramChangeEvent) => void;
};
