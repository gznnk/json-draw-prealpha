import type React from "react";
import { memo } from "react";

import { useDiagramUpdateRecursively } from "../../../../../../hooks/useDiagramUpdateRecursively";
import type { Diagram } from "../../../../../../types/state/core/Diagram";
import { isTextableState } from "../../../../../../utils/validation/isTextableState";
import { Bold as BoldIcon } from "../../../../../icons/Bold";
import { DiagramMenuButton } from "../../common/DiagramMenuButton/DiagramMenuButton";

type BoldMenuProps = {
	selectedDiagrams: Diagram[];
};

const BoldMenuComponent: React.FC<BoldMenuProps> = ({ selectedDiagrams }) => {
	const applyDiagramUpdate = useDiagramUpdateRecursively();

	// Get the first diagram and check if it's textable
	const firstDiagram = selectedDiagrams[0];
	const textableDiagram =
		firstDiagram && isTextableState(firstDiagram) ? firstDiagram : null;

	// Determine if the menu should be shown and if it's active
	const shouldShow = Boolean(textableDiagram);
	const isActive = Boolean(textableDiagram?.fontWeight === "bold");

	const handleClick = () => {
		applyDiagramUpdate({
			items: selectedDiagrams,
			data: {
				fontWeight: isActive ? "normal" : "bold",
			},
		});
	};

	return (
		<DiagramMenuButton
			isActive={isActive}
			onClick={handleClick}
			isHidden={!shouldShow}
		>
			<BoldIcon title="Bold" />
		</DiagramMenuButton>
	);
};

export const BoldMenu = memo(BoldMenuComponent);
