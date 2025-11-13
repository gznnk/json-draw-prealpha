import type React from "react";
import { memo } from "react";

import { AlignmentMenuWrapper } from "./AlignmentMenuStyled";
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
						<DiagramMenuButton
							isActive={textableDiagram?.textAlign === "left"}
							onClick={() => handleTextAlignChange("left")}
						>
							<AlignLeftIcon title="Align Left" />
						</DiagramMenuButton>
						<DiagramMenuButton
							isActive={textableDiagram?.textAlign === "center"}
							onClick={() => handleTextAlignChange("center")}
						>
							<AlignCenter title="Align Center" />
						</DiagramMenuButton>
						<DiagramMenuButton
							isActive={textableDiagram?.textAlign === "right"}
							onClick={() => handleTextAlignChange("right")}
						>
							<AlignRight title="Align Right" />
						</DiagramMenuButton>

						{/* Second row: Vertical alignment */}
						<DiagramMenuButton
							isActive={textableDiagram?.verticalAlign === "top"}
							onClick={() => handleVerticalAlignChange("top")}
						>
							<VerticalAlignTop title="Align Top" />
						</DiagramMenuButton>
						<DiagramMenuButton
							isActive={textableDiagram?.verticalAlign === "center"}
							onClick={() => handleVerticalAlignChange("center")}
						>
							<VerticalAlignMiddle title="Align Middle" />
						</DiagramMenuButton>
						<DiagramMenuButton
							isActive={textableDiagram?.verticalAlign === "bottom"}
							onClick={() => handleVerticalAlignChange("bottom")}
						>
							<VerticalAlignBottom title="Align Bottom" />
						</DiagramMenuButton>
					</AlignmentMenuWrapper>
				</DiagramMenuControl>
			)}
		</DiagramMenuPositioner>
	);
};

export const AlignmentMenu = memo(AlignmentMenuComponent);
