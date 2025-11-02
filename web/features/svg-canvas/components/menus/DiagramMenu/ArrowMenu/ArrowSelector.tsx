import type React from "react";
import { memo } from "react";

import { ArrowSelectorGrid, ArrowSelectorButton } from "./ArrowMenuStyled";
import type { ArrowHeadType } from "../../../../types/core/ArrowHeadType";

type ArrowSelectorProps = {
	selectedArrow: ArrowHeadType | undefined;
	onSelect: (arrowType: ArrowHeadType) => void;
	direction: "start" | "end";
};

const arrowTypes: ArrowHeadType[] = [
	"None",
	"Triangle",
	"ConcaveTriangle",
	"Circle",
];

const ArrowSelectorComponent: React.FC<ArrowSelectorProps> = ({
	selectedArrow,
	onSelect,
	direction,
}) => {
	const renderArrowIcon = (type: ArrowHeadType) => {
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
		<ArrowSelectorGrid>
			{arrowTypes.map((type) => (
				<ArrowSelectorButton
					key={type}
					isActive={selectedArrow === type}
					onClick={() => onSelect(type)}
					title={type}
				>
					{renderArrowIcon(type)}
				</ArrowSelectorButton>
			))}
		</ArrowSelectorGrid>
	);
};

export const ArrowSelector = memo(ArrowSelectorComponent);
