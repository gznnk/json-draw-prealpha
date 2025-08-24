// Import React.
import type React from "react";
import { memo } from "react";

// Import types.
import type { TextProps } from "../../../types/props/elements/TextProps";

/**
 * Text minimap component (simplified version for minimap)
 */
const TextMinimapComponent: React.FC<TextProps> = ({
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
			{text || "Text"}
		</text>
	);
};

export const TextMinimap = memo(TextMinimapComponent);