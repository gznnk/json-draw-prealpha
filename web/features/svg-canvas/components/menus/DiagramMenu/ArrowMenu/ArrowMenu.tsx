import type React from "react";
import { memo, useState } from "react";

import { ArrowSelector } from "./ArrowSelector";
import { useStyleChange } from "../../../../hooks/useStyleChange";
import type { ArrowHeadType } from "../../../../types/core/ArrowHeadType";
import type { Diagram } from "../../../../types/state/core/Diagram";
import { ArrowSwap } from "../../../icons/ArrowSwap";
import { DiagramMenuPositioner } from "../DiagramMenu/DiagramMenuStyled";
import { DiagramMenuControl } from "../DiagramMenuControl";
import { DiagramMenuItemNew } from "../DiagramMenuItem/DiagramMenuItemNew";

type ArrowMenuProps = {
	selectedDiagrams: Diagram[];
};

const ArrowMenuComponent: React.FC<ArrowMenuProps> = ({ selectedDiagrams }) => {
	const applyStyleChange = useStyleChange();
	const [startArrowSelectorOpen, setStartArrowSelectorOpen] = useState(false);
	const [endArrowSelectorOpen, setEndArrowSelectorOpen] = useState(false);

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
		setStartArrowSelectorOpen(false);
	};

	const handleEndArrowChange = (arrowType: ArrowHeadType) => {
		applyStyleChange({
			items: selectedDiagrams,
			styleData: { endArrowHead: arrowType },
		});
		setEndArrowSelectorOpen(false);
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

	const renderArrowPreview = (
		arrowType: ArrowHeadType | undefined,
		direction: "start" | "end",
	) => {
		const type = arrowType || "None";
		const isStart = direction === "start";

		if (type === "None") {
			return (
				<svg width="24" height="24" viewBox="0 0 24 24">
					<line
						x1={isStart ? 6 : 18}
						y1="12"
						x2={isStart ? 18 : 6}
						y2="12"
						stroke="currentColor"
						strokeWidth="2"
					/>
				</svg>
			);
		}

		if (type === "Triangle") {
			return (
				<svg width="24" height="24" viewBox="0 0 24 24">
					<line
						x1={isStart ? 10 : 18}
						y1="12"
						x2={isStart ? 18 : 14}
						y2="12"
						stroke="currentColor"
						strokeWidth="2"
					/>
					<polygon
						points={isStart ? "6,12 10,9 10,15" : "18,12 14,9 14,15"}
						fill="currentColor"
					/>
				</svg>
			);
		}

		if (type === "ConcaveTriangle") {
			return (
				<svg width="24" height="24" viewBox="0 0 24 24">
					<line
						x1={isStart ? 10 : 18}
						y1="12"
						x2={isStart ? 18 : 14}
						y2="12"
						stroke="currentColor"
						strokeWidth="2"
					/>
					<polygon
						points={isStart ? "6,12 10,9 8,12 10,15" : "18,12 14,9 16,12 14,15"}
						fill="currentColor"
					/>
				</svg>
			);
		}

		if (type === "Circle") {
			return (
				<svg width="24" height="24" viewBox="0 0 24 24">
					<line
						x1={isStart ? 9 : 18}
						y1="12"
						x2={isStart ? 18 : 15}
						y2="12"
						stroke="currentColor"
						strokeWidth="2"
					/>
					<circle cx={isStart ? 6 : 18} cy="12" r="3" fill="currentColor" />
				</svg>
			);
		}

		return null;
	};

	return (
		<>
			{/* Start Arrow Button */}
			<DiagramMenuPositioner>
				<DiagramMenuItemNew
					isActive={startArrowSelectorOpen}
					onClick={() => {
						setStartArrowSelectorOpen(!startArrowSelectorOpen);
						setEndArrowSelectorOpen(false);
					}}
				>
					{renderArrowPreview(startArrowHead, "start")}
				</DiagramMenuItemNew>
				{startArrowSelectorOpen && (
					<DiagramMenuControl>
						<ArrowSelector
							selectedArrow={startArrowHead}
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
					isActive={endArrowSelectorOpen}
					onClick={() => {
						setEndArrowSelectorOpen(!endArrowSelectorOpen);
						setStartArrowSelectorOpen(false);
					}}
				>
					{renderArrowPreview(endArrowHead, "end")}
				</DiagramMenuItemNew>
				{endArrowSelectorOpen && (
					<DiagramMenuControl>
						<ArrowSelector
							selectedArrow={endArrowHead}
							onSelect={handleEndArrowChange}
							direction="end"
						/>
					</DiagramMenuControl>
				)}
			</DiagramMenuPositioner>
		</>
	);
};

export const ArrowMenu = memo(ArrowMenuComponent);
