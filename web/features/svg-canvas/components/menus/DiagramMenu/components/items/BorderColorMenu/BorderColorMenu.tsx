import type React from "react";
import { memo } from "react";

import { useDiagramUpdateRecursively } from "../../../../../../hooks/useDiagramUpdateRecursively";
import type { Diagram } from "../../../../../../types/state/core/Diagram";
import { isStrokableState } from "../../../../../../utils/validation/isStrokableState";
import { DiagramMenuPositioner } from "../../../DiagramMenuStyled";
import { ColorPicker } from "../../common/ColorPicker";
import { DiagramMenuItemNew } from "../../common/DiagramMenuItem/DiagramMenuItemNew";

type BorderColorMenuProps = {
	isOpen: boolean;
	onToggle: () => void;
	selectedDiagrams: Diagram[];
};

/**
 * BorderColorMenu component.
 * Displays a hollow circle icon with the current border color and opens a color picker.
 */
const BorderColorMenuComponent: React.FC<BorderColorMenuProps> = ({
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

	// Create a hollow circle SVG icon with the current color
	const icon = (
		<svg
			width={24}
			height={24}
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<title>Border Color</title>
			<circle
				cx="12"
				cy="12"
				r="8"
				fill="none"
				stroke={currentColor}
				strokeWidth="2"
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

export const BorderColorMenu = memo(BorderColorMenuComponent);
