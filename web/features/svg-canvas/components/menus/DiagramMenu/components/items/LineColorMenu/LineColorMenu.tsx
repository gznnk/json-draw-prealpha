import type React from "react";
import { memo } from "react";

import { useDiagramUpdateRecursively } from "../../../../../../hooks/useDiagramUpdateRecursively";
import type { Diagram } from "../../../../../../types/state/core/Diagram";
import { isStrokableState } from "../../../../../../utils/validation/isStrokableState";
import { DiagramMenuPositioner } from "../../../DiagramMenuStyled";
import { ColorPicker } from "../../common/ColorPicker";
import { ColorPreview } from "../../common/ColorPreview";
import { DiagramMenuButton } from "../../common/DiagramMenuButton/DiagramMenuButton";

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

	return (
		<DiagramMenuPositioner>
			<DiagramMenuButton isActive={isOpen} onClick={onToggle}>
				<ColorPreview color={currentColor} title="Line Color" />
			</DiagramMenuButton>
			{isOpen && (
				<ColorPicker color={currentColor} onColorChange={handleColorChange} />
			)}
		</DiagramMenuPositioner>
	);
};

export const LineColorMenu = memo(LineColorMenuComponent);
