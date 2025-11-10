import type React from "react";
import { memo } from "react";

import type { Diagram } from "../../../../types/state/core/Diagram";
import { isFillableState } from "../../../../utils/validation/isFillableState";
import { ColorPicker } from "../ColorPicker";
import { DiagramMenuPositioner } from "../DiagramMenu/DiagramMenuStyled";
import { DiagramMenuItemNew } from "../DiagramMenuItem/DiagramMenuItemNew";

type BackgroundColorMenuProps = {
	isOpen: boolean;
	onToggle: () => void;
	selectedDiagrams: Diagram[];
	onColorChange: (color: string) => void;
};

/**
 * BackgroundColorMenu component.
 * Displays a filled circle icon with the current background color and opens a color picker.
 */
const BackgroundColorMenuComponent: React.FC<BackgroundColorMenuProps> = ({
	isOpen,
	onToggle,
	selectedDiagrams,
	onColorChange,
}) => {
	// Get the first diagram and check if it's fillable
	const firstDiagram = selectedDiagrams[0];
	const fillableDiagram =
		firstDiagram && isFillableState(firstDiagram) ? firstDiagram : null;

	const currentColor = fillableDiagram?.fill || "transparent";

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
				<ColorPicker color={currentColor} onColorChange={onColorChange} />
			)}
		</DiagramMenuPositioner>
	);
};

export const BackgroundColorMenu = memo(BackgroundColorMenuComponent);
