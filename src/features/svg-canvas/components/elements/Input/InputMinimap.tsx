// Import React.
import type React from "react";
import { memo } from "react";

// Import types.
import type { InputProps } from "../../../types/props/elements/InputProps";

/**
 * Input minimap component (simplified version for minimap)
 */
const InputMinimapComponent: React.FC<InputProps> = ({
	x,
	y,
	text,
	fontColor,
	fontSize,
	fontFamily,
	fontWeight,
	textAlign,
}) => {
	return (
		<text
			x={x}
			y={y}
			fill={fontColor}
			fontSize={fontSize}
			fontFamily={fontFamily}
			fontWeight={fontWeight}
			textAnchor={textAlign === "left" ? "start" : textAlign === "right" ? "end" : "middle"}
			dominantBaseline="central"
			pointerEvents="none"
		>
			{text || "Input"}
		</text>
	);
};

export const InputMinimap = memo(InputMinimapComponent);