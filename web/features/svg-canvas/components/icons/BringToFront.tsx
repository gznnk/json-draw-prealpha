import { memo } from "react";

import type { IconProps } from "../../types/props/icon/IconProps";

/**
 * Bring to front icon component
 *
 * @param props - Props for the icon
 * @param props.width - Icon width
 * @param props.height - Icon height
 * @param props.fill - SVG fill color
 * @param props.title - Accessible title for the icon
 * @returns SVG element for bring to front icon
 */
const BringToFrontComponent: React.FC<IconProps> = ({
	width = 24,
	height = 24,
	fill = "#333333",
	title,
}) => {
	return (
		<svg
			width={width}
			height={height}
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<title>{title}</title>
			<polygon points="4,12 12,2 20,12" fill={fill} />
			<polygon points="4,20.5 12,10 20,20.5" fill={fill} />
		</svg>
	);
};

export const BringToFront = memo(BringToFrontComponent);
