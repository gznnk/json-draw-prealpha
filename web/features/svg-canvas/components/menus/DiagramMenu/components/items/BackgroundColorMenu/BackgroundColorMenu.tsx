import type React from "react";
import { memo } from "react";

import { useDiagramUpdateRecursively } from "../../../../../../hooks/useDiagramUpdateRecursively";
import type { Diagram } from "../../../../../../types/state/core/Diagram";
import { isFillableState } from "../../../../../../utils/validation/isFillableState";
import { DiagramMenuPositioner } from "../../../DiagramMenuStyled";
import { ColorPicker } from "../../common/ColorPicker";
import { DiagramMenuItemNew } from "../../common/DiagramMenuItem/DiagramMenuItemNew";

type BackgroundColorMenuProps = {
	isOpen: boolean;
	onToggle: () => void;
	selectedDiagrams: Diagram[];
};

/**
 * BackgroundColorMenu component.
 * Displays a filled circle icon with the current background color and opens a color picker.
 */
const BackgroundColorMenuComponent: React.FC<BackgroundColorMenuProps> = ({
	isOpen,
	onToggle,
	selectedDiagrams,
}) => {
	const applyDiagramUpdate = useDiagramUpdateRecursively();

	// Get the first diagram and check if it's fillable
	const firstDiagram = selectedDiagrams[0];
	const fillableDiagram =
		firstDiagram && isFillableState(firstDiagram) ? firstDiagram : null;

	const currentColor = fillableDiagram?.fill || "transparent";

	const handleColorChange = (color: string) => {
		applyDiagramUpdate({ items: selectedDiagrams, data: { fill: color } });
	};

	// Create a filled circle SVG icon with the current color
	const icon = (
		<svg
			width={24}
			height={24}
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<title>Background Color</title>
			<circle cx="12" cy="12" r="8" fill={currentColor} />
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

export const BackgroundColorMenu = memo(BackgroundColorMenuComponent);
