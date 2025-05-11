import type { CreateDiagramType } from "../DiagramTypes";

/**
 * Type for the data of the Svg component.
 */
export type SvgData = CreateDiagramType<{
	selectable: true;
	transformative: true;
}> & {
	initialWidth: number;
	initialHeight: number;
	svgText: string;
};
