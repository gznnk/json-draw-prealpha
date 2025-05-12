// Import types related to SvgCanvas.
import type { CreateDiagramProps } from "../core/CreateDiagramProps";
import type { ConnectLineData } from "../../data";

/**
 * Props for ConnectLine component.
 */
export type ConnectLineProps = CreateDiagramProps<
	ConnectLineData,
	{
		selectable: true;
		transformative: true;
		itemable: true;
	}
>;
