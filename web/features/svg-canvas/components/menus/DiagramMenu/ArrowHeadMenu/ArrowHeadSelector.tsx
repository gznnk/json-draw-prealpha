import type React from "react";
import { memo } from "react";

import { ArrowHeadIconPreview } from "./ArrowHeadIconPreview";
import {
	ArrowHeadSelectorGrid,
	ArrowHeadSelectorButton,
} from "./ArrowHeadMenuStyled";
import type { ArrowHeadType } from "../../../../types/core/ArrowHeadType";

const arrowHeadTypes: ArrowHeadType[] = [
	"None",
	"Triangle",
	"ConcaveTriangle",
	"Circle",
];

type ArrowHeadSelectorProps = {
	selectedArrowHead: ArrowHeadType | undefined;
	direction: "start" | "end";
	onSelect: (arrowType: ArrowHeadType) => void;
};

const ArrowHeadSelectorComponent: React.FC<ArrowHeadSelectorProps> = ({
	selectedArrowHead,
	direction,
	onSelect,
}) => {
	return (
		<ArrowHeadSelectorGrid>
			{arrowHeadTypes.map((type) => (
				<ArrowHeadSelectorButton
					key={type}
					isActive={selectedArrowHead === type}
					onClick={() => onSelect(type)}
					title={type}
				>
					<ArrowHeadIconPreview arrowType={type} direction={direction} />
				</ArrowHeadSelectorButton>
			))}
		</ArrowHeadSelectorGrid>
	);
};

export const ArrowHeadSelector = memo(ArrowHeadSelectorComponent);
