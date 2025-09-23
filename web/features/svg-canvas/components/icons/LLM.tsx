import React, { memo } from "react";

import type { IconProps } from "../../types/props/icon/IconProps";

/**
 * LLM icon component - represents a brain with neural connections
 *
 * @param props - Props for the icon
 * @param props.width - Icon width
 * @param props.height - Icon height
 * @param props.fill - SVG fill color
 * @param props.title - Accessible title for the icon
 * @returns SVG element for LLM brain icon
 */
const LLMComponent: React.FC<IconProps> = ({
	width = 24,
	height = 24,
	fill = "#000000",
	title = "LLM",
}) => {
	return (
		<svg
			width={width}
			height={height}
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<title>{title}</title>
			<g fill={fill}>
				{/* Brain outline */}
				<path
					d="M12 2c-2.5 0-4.5 1-6 2.5-1 1-1.5 2.5-1.5 4 0 1 0.2 2 0.5 3-0.3 0.5-0.5 1-0.5 1.5 0 1.5 1 3 2.5 4 1.5 1.5 3.5 2.5 6 2.5s4.5-1 6-2.5c1.5-1 2.5-2.5 2.5-4 0-0.5-0.2-1-0.5-1.5 0.3-1 0.5-2 0.5-3 0-1.5-0.5-3-1.5-4C16.5 3 14.5 2 12 2z"
					fill="none"
					stroke={fill}
					strokeWidth="1.5"
				/>
				{/* Neural connections - left hemisphere */}
				<circle cx="8" cy="8" r="1" fill={fill} />
				<circle cx="6" cy="12" r="1" fill={fill} />
				<circle cx="9" cy="15" r="1" fill={fill} />
				<line x1="8" y1="8" x2="6" y2="12" stroke={fill} strokeWidth="0.8" />
				<line x1="6" y1="12" x2="9" y2="15" stroke={fill} strokeWidth="0.8" />

				{/* Neural connections - right hemisphere */}
				<circle cx="16" cy="8" r="1" fill={fill} />
				<circle cx="18" cy="12" r="1" fill={fill} />
				<circle cx="15" cy="15" r="1" fill={fill} />
				<line x1="16" y1="8" x2="18" y2="12" stroke={fill} strokeWidth="0.8" />
				<line x1="18" y1="12" x2="15" y2="15" stroke={fill} strokeWidth="0.8" />

				{/* Central processing connections */}
				<circle cx="12" cy="10" r="1" fill={fill} />
				<circle cx="12" cy="14" r="1" fill={fill} />
				<line x1="8" y1="8" x2="12" y2="10" stroke={fill} strokeWidth="0.8" />
				<line x1="16" y1="8" x2="12" y2="10" stroke={fill} strokeWidth="0.8" />
				<line x1="12" y1="10" x2="12" y2="14" stroke={fill} strokeWidth="0.8" />
				<line x1="12" y1="14" x2="9" y2="15" stroke={fill} strokeWidth="0.8" />
				<line x1="12" y1="14" x2="15" y2="15" stroke={fill} strokeWidth="0.8" />
			</g>
		</svg>
	);
};

export const LLM = memo(LLMComponent);
