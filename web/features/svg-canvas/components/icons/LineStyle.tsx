import type React from "react";

export type LineStyleProps = {
	width?: number;
	height?: number;
	fill?: string;
	title?: string;
};

/**
 * LineStyle icon component
 */
const LineStyleComponent: React.FC<LineStyleProps> = ({
	width = 24,
	height = 24,
	fill = "currentColor",
	title,
}) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={width}
			height={height}
			viewBox="0 0 24 24"
			fill="none"
		>
			{title && <title>{title}</title>}
			{/* Thick line */}
			<line
				x1="4"
				y1="7"
				x2="20"
				y2="7"
				stroke={fill}
				strokeWidth="3"
				strokeLinecap="round"
			/>
			{/* Medium dashed line */}
			<line
				x1="4"
				y1="12"
				x2="20"
				y2="12"
				stroke={fill}
				strokeWidth="2"
				strokeDasharray="4,2"
			/>
			{/* Curved line */}
			<path
				d="M 4,17 Q 12,14 20,17"
				stroke={fill}
				strokeWidth="2"
				fill="none"
			/>
		</svg>
	);
};

export const LineStyle = LineStyleComponent;
