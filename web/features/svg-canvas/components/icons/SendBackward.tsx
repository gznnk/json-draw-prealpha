import { memo } from "react";

import type { IconProps } from "../../types/props/icon/IconProps";

/**
 * Send backward icon component
 */
const SendBackwardComponent: React.FC<IconProps> = ({
	width = 24,
	height = 24,
	fill = "#333333",
	title,
}) => {
	return (
		<svg
			width={width}
			height={height}
			viewBox="0 0 1024 1024"
			xmlns="http://www.w3.org/2000/svg"
		>
			<title>{title}</title>
			<path
				d="M715.8 493.5L335 165.1c-14.2-12.2-35-1.2-35 18.5v656.8c0 19.7 20.8 30.7 35 18.5l380.8-328.4c10.9-9.4 10.9-27.6 0-37z"
				fill={fill}
				transform="rotate(90 512 512)"
			/>
		</svg>
	);
};

export const SendBackward = memo(SendBackwardComponent);
