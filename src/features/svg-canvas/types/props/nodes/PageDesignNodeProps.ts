// Import types related to SvgCanvas.
import type { CreateDiagramProps } from "../core/CreateDiagramProps";
import type { PageDesignNodeData } from "../../data/nodes/PageDesignNodeData";

/**
 * Type of the PageDesignNode component props.
 */
export type PageDesignNodeProps = CreateDiagramProps<
	PageDesignNodeData,
	{
		selectable: true;
		transformative: true;
		connectable: true;
		executable: true;
		itemCreatable: true;
	}
>;
