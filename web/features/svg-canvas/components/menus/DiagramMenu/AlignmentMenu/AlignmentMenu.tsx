import type React from "react";
import { memo } from "react";

import { DiagramMenuPositioner } from "../DiagramMenu/DiagramMenuStyled";
import { DiagramMenuControl } from "../DiagramMenuControl";
import { AlignmentMenuWrapper, AlignmentButton } from "./AlignmentMenuStyled";
import { useStyleChange } from "../../../../hooks/useStyleChange";
import type { TextableData } from "../../../../types/data/core/TextableData";
import type { Diagram } from "../../../../types/state/core/Diagram";
import { AlignCenter } from "../../../icons/AlignCenter";
import { AlignLeft as AlignLeftIcon } from "../../../icons/AlignLeft";
import { AlignRight } from "../../../icons/AlignRight";
import { VerticalAlignBottom } from "../../../icons/VerticalAlignBottom";
import { VerticalAlignMiddle } from "../../../icons/VerticalAlignMiddle";
import { VerticalAlignTop } from "../../../icons/VerticalAlignTop";
import { DiagramMenuItemNew } from "../DiagramMenuItem/DiagramMenuItemNew";

type AlignmentMenuProps = {
	isOpen: boolean;
	onToggle: () => void;
	diagram: TextableData;
	selectedDiagrams: Diagram[];
};

const AlignmentMenuComponent: React.FC<AlignmentMenuProps> = ({
	isOpen,
	onToggle,
	diagram,
	selectedDiagrams,
}) => {
	const applyStyleChange = useStyleChange();

	const handleTextAlignChange = (align: "left" | "center" | "right") => {
		applyStyleChange({
			items: selectedDiagrams,
			styleData: { textAlign: align },
		});
	};

	const handleVerticalAlignChange = (align: "top" | "center" | "bottom") => {
		applyStyleChange({
			items: selectedDiagrams,
			styleData: { verticalAlign: align },
		});
	};

	return (
		<DiagramMenuPositioner>
			<DiagramMenuItemNew isActive={isOpen} onClick={onToggle}>
				<AlignLeftIcon title="Alignment" />
			</DiagramMenuItemNew>
			{isOpen && (
				<DiagramMenuControl>
					<AlignmentMenuWrapper>
						{/* First row: Horizontal alignment */}
						<AlignmentButton
							isActive={diagram.textAlign === "left"}
							onClick={() => handleTextAlignChange("left")}
							title="Align Left"
						>
							<AlignLeftIcon />
						</AlignmentButton>
						<AlignmentButton
							isActive={diagram.textAlign === "center"}
							onClick={() => handleTextAlignChange("center")}
							title="Align Center"
						>
							<AlignCenter />
						</AlignmentButton>
						<AlignmentButton
							isActive={diagram.textAlign === "right"}
							onClick={() => handleTextAlignChange("right")}
							title="Align Right"
						>
							<AlignRight />
						</AlignmentButton>

						{/* Second row: Vertical alignment */}
						<AlignmentButton
							isActive={diagram.verticalAlign === "top"}
							onClick={() => handleVerticalAlignChange("top")}
							title="Align Top"
						>
							<VerticalAlignTop />
						</AlignmentButton>
						<AlignmentButton
							isActive={diagram.verticalAlign === "center"}
							onClick={() => handleVerticalAlignChange("center")}
							title="Align Middle"
						>
							<VerticalAlignMiddle />
						</AlignmentButton>
						<AlignmentButton
							isActive={diagram.verticalAlign === "bottom"}
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
