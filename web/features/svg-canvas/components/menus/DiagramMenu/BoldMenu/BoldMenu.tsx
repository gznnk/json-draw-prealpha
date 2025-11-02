import type React from "react";
import { memo } from "react";

import { useStyleChange } from "../../../../hooks/useStyleChange";
import type { Diagram } from "../../../../types/state/core/Diagram";
import { isTextableState } from "../../../../utils/validation/isTextableState";
import { Bold as BoldIcon } from "../../../icons/Bold";
import { DiagramMenuItemNew } from "../DiagramMenuItem/DiagramMenuItemNew";

type BoldMenuProps = {
	selectedDiagrams: Diagram[];
};

const BoldMenuComponent: React.FC<BoldMenuProps> = ({ selectedDiagrams }) => {
	const applyStyleChange = useStyleChange();

	// Get the first diagram and check if it's textable
	const firstDiagram = selectedDiagrams[0];
	const textableDiagram =
		firstDiagram && isTextableState(firstDiagram) ? firstDiagram : null;

	// Determine if the menu should be shown and if it's active
	const shouldShow = Boolean(textableDiagram);
	const isActive = Boolean(textableDiagram?.fontWeight === "bold");

	const handleClick = () => {
		applyStyleChange({
			items: selectedDiagrams,
			styleData: {
				fontWeight: isActive ? "normal" : "bold",
			},
		});
	};

	return (
		<DiagramMenuItemNew
			isActive={isActive}
			onClick={handleClick}
			isHidden={!shouldShow}
		>
			<BoldIcon title="Bold" />
		</DiagramMenuItemNew>
	);
};

export const BoldMenu = memo(BoldMenuComponent);
