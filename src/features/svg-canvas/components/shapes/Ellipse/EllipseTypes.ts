// Import types related to SvgCanvas.
import type { CreateDiagramProps } from "../../../types/props/CreateDiagramProps";
import type { EllipseData } from "../../../types/data";

/**
 * 楕円コンポーネントのプロパティ
 */
export type EllipseProps = CreateDiagramProps<
	EllipseData,
	{
		selectable: true;
		transformative: true;
		connectable: true;
		textable: true;
	}
>;
