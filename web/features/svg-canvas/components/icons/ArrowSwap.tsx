import type React from "react";
import { memo } from "react";

type ArrowSwapProps = {
	title?: string;
};

const ArrowSwapComponent: React.FC<ArrowSwapProps> = ({ title }) => {
	return (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			{title && <title>{title}</title>}
			<path d="M7 16V4M7 4L3 8M7 4L11 8" />
			<path d="M17 8V20M17 20L21 16M17 20L13 16" />
		</svg>
	);
};

export const ArrowSwap = memo(ArrowSwapComponent);
