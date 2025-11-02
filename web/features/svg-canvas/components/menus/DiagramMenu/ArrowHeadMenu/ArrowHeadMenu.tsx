import type React from "react";
import { memo, useState } from "react";

import { ArrowHeadIconPreview } from "./ArrowHeadIconPreview";
import { ArrowHeadSelector } from "./ArrowHeadSelector";
import { useStyleChange } from "../../../../hooks/useStyleChange";
import type { ArrowHeadType } from "../../../../types/core/ArrowHeadType";
import type { Diagram } from "../../../../types/state/core/Diagram";
import { ArrowSwap } from "../../../icons/ArrowSwap";
import { DiagramMenuPositioner } from "../DiagramMenu/DiagramMenuStyled";
import { DiagramMenuControl } from "../DiagramMenuControl";
import { DiagramMenuItemNew } from "../DiagramMenuItem/DiagramMenuItemNew";

type ArrowHeadMenuProps = {
	selectedDiagrams: Diagram[];
};

const ArrowHeadMenuComponent: React.FC<ArrowHeadMenuProps> = ({
	selectedDiagrams,
}) => {
	const applyStyleChange = useStyleChange();

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
		applyStyleChange({
			items: selectedDiagrams,
			styleData: { startArrowHead: arrowType },
		});
		setStartArrowHeadSelectorOpen(false);
	};

	const handleEndArrowChange = (arrowType: ArrowHeadType) => {
		applyStyleChange({
			items: selectedDiagrams,
			styleData: { endArrowHead: arrowType },
		});
		setEndArrowHeadSelectorOpen(false);
	};

	const handleSwapArrows = () => {
		applyStyleChange({
			items: selectedDiagrams,
			styleData: {
				startArrowHead: endArrowHead || "None",
				endArrowHead: startArrowHead || "None",
			},
		});
	};

	return (
		<>
			{/* Start Arrow Button */}
			<DiagramMenuPositioner>
				<DiagramMenuItemNew
					isActive={startArrowHeadSelectorOpen}
					onClick={() => {
						setStartArrowHeadSelectorOpen(!startArrowHeadSelectorOpen);
						setEndArrowHeadSelectorOpen(false);
					}}
				>
					<ArrowHeadIconPreview arrowType={startArrowHead} direction="start" />
				</DiagramMenuItemNew>
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
			<DiagramMenuItemNew onClick={handleSwapArrows}>
				<ArrowSwap title="Swap arrows" />
			</DiagramMenuItemNew>

			{/* End Arrow Button */}
			<DiagramMenuPositioner>
				<DiagramMenuItemNew
					isActive={endArrowHeadSelectorOpen}
					onClick={() => {
						setEndArrowHeadSelectorOpen(!endArrowHeadSelectorOpen);
						setStartArrowHeadSelectorOpen(false);
					}}
				>
					<ArrowHeadIconPreview arrowType={endArrowHead} direction="end" />
				</DiagramMenuItemNew>
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
