import type React from "react";
import { memo, useState } from "react";

import { ArrowHeadIconPreview } from "./ArrowHeadIconPreview";
import { ArrowHeadSelector } from "./ArrowHeadSelector";
import { useDiagramUpdateRecursively } from "../../../../../../hooks/useDiagramUpdateRecursively";
import type { ArrowHeadType } from "../../../../../../types/core/ArrowHeadType";
import type { Diagram } from "../../../../../../types/state/core/Diagram";
import { ArrowSwap } from "../../../../../icons/ArrowSwap";
import { DiagramMenuPositioner } from "../../../DiagramMenuStyled";
import { DiagramMenuButton } from "../../common/DiagramMenuButton/DiagramMenuButton";
import { DiagramMenuControl } from "../../common/DiagramMenuControl";

type ArrowHeadMenuProps = {
	selectedDiagrams: Diagram[];
};

const ArrowHeadMenuComponent: React.FC<ArrowHeadMenuProps> = ({
	selectedDiagrams,
}) => {
	const applyDiagramUpdate = useDiagramUpdateRecursively();

	const [startArrowHeadSelectorOpen, setStartArrowHeadSelectorOpen] =
		useState(false);
	const [endArrowHeadSelectorOpen, setEndArrowHeadSelectorOpen] =
		useState(false);

	// Get the first diagram's arrow settings
	const firstDiagram = selectedDiagrams[0];
	const startArrowHead = (
		firstDiagram as { startArrowHead?: ArrowHeadType } | undefined
	)?.startArrowHead;
	const endArrowHead = (
		firstDiagram as { endArrowHead?: ArrowHeadType } | undefined
	)?.endArrowHead;

	const handleStartArrowChange = (arrowType: ArrowHeadType) => {
		applyDiagramUpdate({
			items: selectedDiagrams,
			data: { startArrowHead: arrowType },
		});
		setStartArrowHeadSelectorOpen(false);
	};

	const handleEndArrowChange = (arrowType: ArrowHeadType) => {
		applyDiagramUpdate({
			items: selectedDiagrams,
			data: { endArrowHead: arrowType },
		});
		setEndArrowHeadSelectorOpen(false);
	};

	const handleSwapArrows = () => {
		applyDiagramUpdate({
			items: selectedDiagrams,
			data: {
				startArrowHead: endArrowHead || "None",
				endArrowHead: startArrowHead || "None",
			},
		});
	};

	return (
		<>
			{/* Start Arrow Button */}
			<DiagramMenuPositioner>
				<DiagramMenuButton
					isActive={startArrowHeadSelectorOpen}
					onClick={() => {
						setStartArrowHeadSelectorOpen(!startArrowHeadSelectorOpen);
						setEndArrowHeadSelectorOpen(false);
					}}
				>
					<ArrowHeadIconPreview arrowType={startArrowHead} direction="start" />
				</DiagramMenuButton>
				{startArrowHeadSelectorOpen && (
					<DiagramMenuControl>
						<ArrowHeadSelector
							selectedArrowHead={startArrowHead}
							onSelect={handleStartArrowChange}
							direction="start"
						/>
					</DiagramMenuControl>
				)}
			</DiagramMenuPositioner>

			{/* Swap Arrows Button */}
			<DiagramMenuButton onClick={handleSwapArrows}>
				<ArrowSwap fill="#333333" width={24} height={24} title="Swap arrows" />
			</DiagramMenuButton>

			{/* End Arrow Button */}
			<DiagramMenuPositioner>
				<DiagramMenuButton
					isActive={endArrowHeadSelectorOpen}
					onClick={() => {
						setEndArrowHeadSelectorOpen(!endArrowHeadSelectorOpen);
						setStartArrowHeadSelectorOpen(false);
					}}
				>
					<ArrowHeadIconPreview arrowType={endArrowHead} direction="end" />
				</DiagramMenuButton>
				{endArrowHeadSelectorOpen && (
					<DiagramMenuControl>
						<ArrowHeadSelector
							selectedArrowHead={endArrowHead}
							onSelect={handleEndArrowChange}
							direction="end"
						/>
					</DiagramMenuControl>
				)}
			</DiagramMenuPositioner>
		</>
	);
};

export const ArrowHeadMenu = memo(ArrowHeadMenuComponent);
