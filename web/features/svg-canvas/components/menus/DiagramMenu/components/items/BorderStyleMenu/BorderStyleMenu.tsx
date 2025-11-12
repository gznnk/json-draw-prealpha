import type React from "react";
import { memo } from "react";

import {
	BorderStyleMenuWrapper,
	BorderStyleSection,
	BorderStyleButton,
} from "./BorderStyleMenuStyled";
import { useDiagramUpdateRecursively } from "../../../../../../hooks/useDiagramUpdateRecursively";
import type { StrokeDashType } from "../../../../../../types/core/StrokeDashType";
import type { Diagram } from "../../../../../../types/state/core/Diagram";
import { isCornerRoundableState } from "../../../../../../utils/validation/isCornerRoundableState";
import { isStrokableState } from "../../../../../../utils/validation/isStrokableState";
import { DashedCircle } from "../../../../../icons/DashedCircle";
import { DashedLine } from "../../../../../icons/DashedLine";
import { DottedLine } from "../../../../../icons/DottedLine";
import { SolidLine } from "../../../../../icons/SolidLine";
import { DiagramMenuPositioner } from "../../../DiagramMenuStyled";
import { DiagramMenuControl } from "../../common/DiagramMenuControl";
import { DiagramMenuItemNew } from "../../common/DiagramMenuItem/DiagramMenuItemNew";
import { MenuSlider } from "../../common/MenuSlider";

type BorderStyleMenuProps = {
	isOpen: boolean;
	onToggle: () => void;
	selectedDiagrams: Diagram[];
	/** Whether to show corner radius control */
	showRadius?: boolean;
};

const BorderStyleMenuComponent: React.FC<BorderStyleMenuProps> = ({
	isOpen,
	onToggle,
	selectedDiagrams,
	showRadius = true,
}) => {
	const applyDiagramUpdate = useDiagramUpdateRecursively();

	// Get the first diagram
	const firstDiagram = selectedDiagrams[0];

	// Type-safe extraction of properties using type guards
	const strokeWidth = isStrokableState(firstDiagram)
		? firstDiagram.strokeWidth
		: 2;
	const strokeDashType = isStrokableState(firstDiagram)
		? firstDiagram.strokeDashType
		: undefined;
	const cornerRadius = isCornerRoundableState(firstDiagram)
		? firstDiagram.cornerRadius
		: 0;

	const handleStrokeWidthChange = (width: number) => {
		// Real-time update (no history saving)
		applyDiagramUpdate({
			items: selectedDiagrams,
			data: { strokeWidth: width },
			skipHistory: true,
		});
	};

	const handleStrokeWidthCommit = (width: number) => {
		// Save history on commit
		applyDiagramUpdate({
			items: selectedDiagrams,
			data: { strokeWidth: width },
		});
	};

	const handleStrokeDashChange = (dashType: StrokeDashType) => {
		applyDiagramUpdate({
			items: selectedDiagrams,
			data: { strokeDashType: dashType },
		});
	};

	const handleCornerRadiusChange = (radius: number) => {
		// Real-time update (no history saving)
		applyDiagramUpdate({
			items: selectedDiagrams,
			data: { cornerRadius: radius },
			skipHistory: true,
		});
	};

	const handleCornerRadiusCommit = (radius: number) => {
		// Save history on commit
		applyDiagramUpdate({
			items: selectedDiagrams,
			data: { cornerRadius: radius },
		});
	};

	return (
		<DiagramMenuPositioner>
			<DiagramMenuItemNew isActive={isOpen} onClick={onToggle}>
				<DashedCircle title="Border Style" />
			</DiagramMenuItemNew>
			{isOpen && (
				<DiagramMenuControl>
					<BorderStyleMenuWrapper>
						{/* Stroke Dash Type */}
						<BorderStyleSection>
							<BorderStyleButton
								isActive={strokeDashType === "solid"}
								onClick={() => handleStrokeDashChange("solid")}
								title="Solid line"
							>
								<SolidLine />
							</BorderStyleButton>
							<BorderStyleButton
								isActive={strokeDashType === "dashed"}
								onClick={() => handleStrokeDashChange("dashed")}
								title="Dashed line"
							>
								<DashedLine />
							</BorderStyleButton>
							<BorderStyleButton
								isActive={strokeDashType === "dotted"}
								onClick={() => handleStrokeDashChange("dotted")}
								title="Dotted line"
							>
								<DottedLine />
							</BorderStyleButton>
						</BorderStyleSection>

						{/* Stroke Width */}
						<MenuSlider
							label="Border Width"
							value={strokeWidth}
							min={0}
							max={100}
							onChange={handleStrokeWidthChange}
							onChangeCommit={handleStrokeWidthCommit}
						/>

						{/* Corner Radius */}
						{showRadius && (
							<MenuSlider
								label="Corner Radius"
								value={cornerRadius}
								min={0}
								max={100}
								onChange={handleCornerRadiusChange}
								onChangeCommit={handleCornerRadiusCommit}
							/>
						)}
					</BorderStyleMenuWrapper>
				</DiagramMenuControl>
			)}
		</DiagramMenuPositioner>
	);
};

export const BorderStyleMenu = memo(BorderStyleMenuComponent);
