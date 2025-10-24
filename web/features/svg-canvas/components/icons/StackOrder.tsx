import { memo } from "react";

import type { IconProps } from "../../types/props/icon/IconProps";

/**
 * Stack order icon component - represents layering and z-index control
 *
 * @param props - Props for the icon
 * @param props.width - Icon width
 * @param props.height - Icon height
 * @param props.fill - SVG fill color
 * @param props.title - Accessible title for the icon
 * @returns SVG element for stack order icon
 */
const StackOrderComponent: React.FC<IconProps> = ({
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
			fill="none"
		>
			<title>{title}</title>
			{/* Back layer */}
			<rect
				x="3"
				y="7"
				width="10"
				height="10"
				rx="1.5"
				stroke={fill}
				strokeWidth="1.5"
				fill="none"
			/>
			{/* Middle layer */}
			<rect
				x="7"
				y="11"
				width="10"
				height="10"
				rx="1.5"
				stroke={fill}
				strokeWidth="1.5"
				fill="white"
			/>
			{/* Front layer */}
			<rect
				x="11"
				y="3"
				width="10"
				height="10"
				rx="1.5"
				stroke={fill}
				strokeWidth="1.5"
				fill="white"
			/>
		</svg>
	);
};

export const StackOrder = memo(StackOrderComponent);
