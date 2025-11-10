import type React from "react";
import { memo } from "react";

import { useDiagramUpdateRecursively } from "../../../../hooks/useDiagramUpdateRecursively";
import type { Diagram } from "../../../../types/state/core/Diagram";
import { isStrokableState } from "../../../../utils/validation/isStrokableState";
import { ColorPicker } from "../ColorPicker";
import { DiagramMenuPositioner } from "../DiagramMenu/DiagramMenuStyled";
import { DiagramMenuItemNew } from "../DiagramMenuItem/DiagramMenuItemNew";

type LineColorMenuProps = {
	isOpen: boolean;
	onToggle: () => void;
	selectedDiagrams: Diagram[];
};

/**
 * LineColorMenu component.
 * Displays a 45-degree line icon with the current line color and opens a color picker.
 */
const LineColorMenuComponent: React.FC<LineColorMenuProps> = ({
	isOpen,
	onToggle,
	selectedDiagrams,
}) => {
	const applyDiagramUpdate = useDiagramUpdateRecursively();

	// Get the first diagram and check if it's strokeable
	const firstDiagram = selectedDiagrams[0];
	const strokeableDiagram =
		firstDiagram && isStrokableState(firstDiagram) ? firstDiagram : null;

	const currentColor = strokeableDiagram?.stroke || "transparent";

	const handleColorChange = (color: string) => {
		applyDiagramUpdate({ items: selectedDiagrams, data: { stroke: color } });
	};

	// Create a 45-degree line SVG icon with the current color
	const icon = (
		<svg
			width={24}
			height={24}
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<title>Line Color</title>
			<line
				x1="6"
				y1="18"
				x2="18"
				y2="6"
				stroke={currentColor}
				strokeWidth="2"
				strokeLinecap="round"
			/>
		</svg>
	);

	return (
		<DiagramMenuPositioner>
			<DiagramMenuItemNew isActive={isOpen} onClick={onToggle}>
				{icon}
			</DiagramMenuItemNew>
			{isOpen && (
				<ColorPicker color={currentColor} onColorChange={handleColorChange} />
			)}
		</DiagramMenuPositioner>
	);
};

export const LineColorMenu = memo(LineColorMenuComponent);
