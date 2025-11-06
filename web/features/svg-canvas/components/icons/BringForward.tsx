import { memo } from "react";

import type { IconProps } from "../../types/props/icon/IconProps";

/**
 * Bring forward icon component
 *
 * @param props - Props for the icon
 * @param props.width - Icon width
 * @param props.height - Icon height
 * @param props.fill - SVG fill color
 * @param props.title - Accessible title for the icon
 * @returns SVG element for bring forward icon
 */
const BringForwardComponent: React.FC<IconProps> = ({
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
			<path
				d="M16.8 11.6L7.9 3.9c-.33-.29-.82-.03-.82.43v15.4c0 .46.49.72.82.43l8.9-7.7c.26-.22.26-.65 0-.87z"
				fill={fill}
				transform="rotate(-90 12 12)"
			/>
		</svg>
	);
};

export const BringForward = memo(BringForwardComponent);
