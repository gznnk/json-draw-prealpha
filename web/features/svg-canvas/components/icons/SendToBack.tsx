import React, { memo } from "react";

import type { IconProps } from "../../types/props/icon/IconProps";

/**
 * Send to back icon component
 */
const SendToBackComponent: React.FC<IconProps> = ({
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
				d="M19.4 11.7L12.6 5.9c-.25-.22-.62-.02-.62.33v11.6c0 .35.37.54.62.33l6.8-5.8c.19-.17.19-.49 0-.66zm-7.5 0L5.1 5.9c-.25-.22-.62-.02-.62.33v11.6c0 .35.37.54.62.33l6.8-5.8c.1-.08.15-.21.15-.33 0-.12-.05-.24-.15-.33z"
				fill={fill}
				transform="rotate(90 12 12)"
			/>
		</svg>
	);
};

export const SendToBack = memo(SendToBackComponent);
