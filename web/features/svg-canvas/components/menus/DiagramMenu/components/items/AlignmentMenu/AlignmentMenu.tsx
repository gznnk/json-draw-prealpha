import type React from "react";
import { memo } from "react";

import { AlignmentMenuWrapper, AlignmentButton } from "./AlignmentMenuStyled";
import { useDiagramUpdateRecursively } from "../../../../../../hooks/useDiagramUpdateRecursively";
import type { Diagram } from "../../../../../../types/state/core/Diagram";
import { isTextableState } from "../../../../../../utils/validation/isTextableState";
import { AlignCenter } from "../../../../../icons/AlignCenter";
import { AlignLeft as AlignLeftIcon } from "../../../../../icons/AlignLeft";
import { AlignRight } from "../../../../../icons/AlignRight";
import { VerticalAlignBottom } from "../../../../../icons/VerticalAlignBottom";
import { VerticalAlignMiddle } from "../../../../../icons/VerticalAlignMiddle";
import { VerticalAlignTop } from "../../../../../icons/VerticalAlignTop";
import { DiagramMenuPositioner } from "../../../DiagramMenuStyled";
import { DiagramMenuButton } from "../../common/DiagramMenuButton/DiagramMenuButton";
import { DiagramMenuControl } from "../../common/DiagramMenuControl";

type AlignmentMenuProps = {
	isOpen: boolean;
	onToggle: () => void;
	selectedDiagrams: Diagram[];
};

const AlignmentMenuComponent: React.FC<AlignmentMenuProps> = ({
	isOpen,
	onToggle,
	selectedDiagrams,
}) => {
	const applyDiagramUpdate = useDiagramUpdateRecursively();

	// Get the first diagram and check if it's textable
	const firstDiagram = selectedDiagrams[0];
	const textableDiagram =
		firstDiagram && isTextableState(firstDiagram) ? firstDiagram : null;

	const handleTextAlignChange = (align: "left" | "center" | "right") => {
		applyDiagramUpdate({
			items: selectedDiagrams,
			data: { textAlign: align },
		});
	};

	const handleVerticalAlignChange = (align: "top" | "center" | "bottom") => {
		applyDiagramUpdate({
			items: selectedDiagrams,
			data: { verticalAlign: align },
		});
	};

	return (
		<DiagramMenuPositioner>
			<DiagramMenuButton isActive={isOpen} onClick={onToggle}>
				<AlignCenter title="Alignment" />
			</DiagramMenuButton>
			{isOpen && (
				<DiagramMenuControl>
					<AlignmentMenuWrapper>
						{/* First row: Horizontal alignment */}
						<AlignmentButton
							isActive={textableDiagram?.textAlign === "left"}
							onClick={() => handleTextAlignChange("left")}
							title="Align Left"
						>
							<AlignLeftIcon />
						</AlignmentButton>
						<AlignmentButton
							isActive={textableDiagram?.textAlign === "center"}
							onClick={() => handleTextAlignChange("center")}
							title="Align Center"
						>
							<AlignCenter />
						</AlignmentButton>
						<AlignmentButton
							isActive={textableDiagram?.textAlign === "right"}
							onClick={() => handleTextAlignChange("right")}
							title="Align Right"
						>
							<AlignRight />
						</AlignmentButton>

						{/* Second row: Vertical alignment */}
						<AlignmentButton
							isActive={textableDiagram?.verticalAlign === "top"}
							onClick={() => handleVerticalAlignChange("top")}
							title="Align Top"
						>
							<VerticalAlignTop />
						</AlignmentButton>
						<AlignmentButton
							isActive={textableDiagram?.verticalAlign === "center"}
							onClick={() => handleVerticalAlignChange("center")}
							title="Align Middle"
						>
							<VerticalAlignMiddle />
						</AlignmentButton>
						<AlignmentButton
							isActive={textableDiagram?.verticalAlign === "bottom"}
							onClick={() => handleVerticalAlignChange("bottom")}
							title="Align Bottom"
						>
							<VerticalAlignBottom />
						</AlignmentButton>
					</AlignmentMenuWrapper>
				</DiagramMenuControl>
			)}
		</DiagramMenuPositioner>
	);
};

export const AlignmentMenu = memo(AlignmentMenuComponent);
