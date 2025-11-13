import type React from "react";
import { memo } from "react";

import {
	LineStyleMenuWrapper,
	LineStyleSection,
	LineStyleButton,
} from "./LineStyleMenuStyled";
import { useDiagramUpdateRecursively } from "../../../../../../hooks/useDiagramUpdateRecursively";
import type { PathType } from "../../../../../../types/core/PathType";
import type { StrokeDashType } from "../../../../../../types/core/StrokeDashType";
import type { Diagram } from "../../../../../../types/state/core/Diagram";
import { CurvePathIcon } from "../../../../../icons/CurvePathIcon";
import { DashedLine } from "../../../../../icons/DashedLine";
import { DottedLine } from "../../../../../icons/DottedLine";
import { LineStyle as LineStyleIcon } from "../../../../../icons/LineStyle";
import { PolylinePathIcon } from "../../../../../icons/PolylinePathIcon";
import { RoundedPathIcon } from "../../../../../icons/RoundedPathIcon";
import { SolidLine } from "../../../../../icons/SolidLine";
import { StraightPathIcon } from "../../../../../icons/StraightPathIcon";
import { DiagramMenuPositioner } from "../../../DiagramMenuStyled";
import { DiagramMenuButton } from "../../common/DiagramMenuButton/DiagramMenuButton";
import { DiagramMenuControl } from "../../common/DiagramMenuControl";
import { MenuSlider } from "../../common/MenuSlider";

type LineStyleMenuProps = {
	isOpen: boolean;
	onToggle: () => void;
	selectedDiagrams: Diagram[];
};

const LineStyleMenuComponent: React.FC<LineStyleMenuProps> = ({
	isOpen,
	onToggle,
	selectedDiagrams,
}) => {
	const applyDiagramUpdate = useDiagramUpdateRecursively();

	// Get the first diagram
	const firstDiagram = selectedDiagrams[0];

	// Get stroke width, path type, and stroke dash type from the first diagram
	// If the property doesn't exist, it will be undefined
	const strokeWidth =
		(firstDiagram as { strokeWidth?: number } | undefined)?.strokeWidth ?? 2;
	const pathType = (firstDiagram as { pathType?: PathType } | undefined)
		?.pathType;
	const strokeDashType = (
		firstDiagram as { strokeDashType?: StrokeDashType } | undefined
	)?.strokeDashType;

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

	const handlePathTypeChange = (type: PathType) => {
		applyDiagramUpdate({
			items: selectedDiagrams,
			data: { pathType: type },
		});
	};

	const handleStrokeDashChange = (dashType: StrokeDashType) => {
		applyDiagramUpdate({
			items: selectedDiagrams,
			data: { strokeDashType: dashType },
		});
	};

	return (
		<DiagramMenuPositioner>
			<DiagramMenuButton isActive={isOpen} onClick={onToggle}>
				<LineStyleIcon title="Line Style" />
			</DiagramMenuButton>
			{isOpen && (
				<DiagramMenuControl>
					<LineStyleMenuWrapper>
						<MenuSlider
							label="Line Width"
							value={strokeWidth}
							min={1}
							max={100}
							onChange={handleStrokeWidthChange}
							onChangeCommit={handleStrokeWidthCommit}
						/>
						{/* Path Type */}
						<LineStyleSection>
							<LineStyleButton
								isActive={pathType === "Straight"}
								onClick={() => handlePathTypeChange("Straight")}
								title="Straight path"
							>
								<StraightPathIcon />
							</LineStyleButton>
							<LineStyleButton
								isActive={pathType === "Polyline"}
								onClick={() => handlePathTypeChange("Polyline")}
								title="Polyline path"
							>
								<PolylinePathIcon />
							</LineStyleButton>
							<LineStyleButton
								isActive={pathType === "Rounded"}
								onClick={() => handlePathTypeChange("Rounded")}
								title="Rounded path"
							>
								<RoundedPathIcon />
							</LineStyleButton>
							<LineStyleButton
								isActive={pathType === "Curve"}
								onClick={() => handlePathTypeChange("Curve")}
								title="Curve path"
							>
								<CurvePathIcon />
							</LineStyleButton>
						</LineStyleSection>

						{/* Stroke Dash Type */}
						<LineStyleSection>
							<LineStyleButton
								isActive={strokeDashType === "solid"}
								onClick={() => handleStrokeDashChange("solid")}
								title="Solid line"
							>
								<SolidLine />
							</LineStyleButton>
							<LineStyleButton
								isActive={strokeDashType === "dashed"}
								onClick={() => handleStrokeDashChange("dashed")}
								title="Dashed line"
							>
								<DashedLine />
							</LineStyleButton>
							<LineStyleButton
								isActive={strokeDashType === "dotted"}
								onClick={() => handleStrokeDashChange("dotted")}
								title="Dotted line"
							>
								<DottedLine />
							</LineStyleButton>
						</LineStyleSection>
					</LineStyleMenuWrapper>
				</DiagramMenuControl>
			)}
		</DiagramMenuPositioner>
	);
};

export const LineStyleMenu = memo(LineStyleMenuComponent);
