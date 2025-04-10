// TODO: 場所
import { getSelectedItems } from "../../../diagrams/SvgCanvas/SvgCanvasFunctions";

// Import types related to SvgCanvas.
import type { SvgCanvasProps } from "../../../diagrams/SvgCanvas/SvgCanvasTypes";

// Import functions related to SvgCanvas.
import { isTransformativeData } from "../../../../utils/Diagram";

// Imports related to this component.
import type { DiagramMenuProps } from "./DiagramMenuTypes";

export const useDiagramMenu = (canvasProps: SvgCanvasProps) => {
	// Extract properties from canvasProps.
	const { items, isDiagramChanging, multiSelectGroup } = canvasProps;

	// Invisible menu props.
	let diagramMenuProps = {
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		rotation: 0,
		scaleX: 1,
		scaleY: 1,
		isVisible: false,
	} as DiagramMenuProps;

	const selectedItems = getSelectedItems(items);
	const showDiagramMenu = 0 < selectedItems.length && !isDiagramChanging;

	if (showDiagramMenu) {
		if (multiSelectGroup) {
			const { x, y, width, height, rotation, scaleX, scaleY } =
				multiSelectGroup;
			diagramMenuProps = {
				x,
				y,
				width,
				height,
				rotation,
				scaleX,
				scaleY,
				isVisible: true,
			};
		} else {
			const diagram = selectedItems[0];
			if (isTransformativeData(diagram)) {
				diagramMenuProps = {
					x: diagram.x,
					y: diagram.y,
					width: diagram.width,
					height: diagram.height,
					rotation: diagram.rotation,
					scaleX: diagram.scaleX,
					scaleY: diagram.scaleY,
					isVisible: true,
				};
			}
		}
	}

	return {
		diagramMenuProps,
	};
};
