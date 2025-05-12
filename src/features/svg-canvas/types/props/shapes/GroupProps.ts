// Import types related to SvgCanvas.
import type { CreateDiagramProps } from "../core/CreateDiagramProps";
import type { GroupData } from "../../data";

/**
 * Props for Group component.
 */
export type GroupProps = CreateDiagramProps<
	GroupData,
	{
		selectable: true;
		transformative: true;
		itemable: true;
		connectable: true;
		textable: true;
		executable: true;
	}
>;
