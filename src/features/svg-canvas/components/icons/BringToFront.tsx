// Import React.
import { memo } from "react";

/**
 * Props for BringToFront icon
 */
type BringToFrontProps = {
	width?: number;
	height?: number;
	fill?: string;
	title?: string;
};

/**
 * Bring to front icon component
 */
export const BringToFront = memo<BringToFrontProps>(
	({ width = 24, height = 24, fill = "#333333", title }) => {
		return (
			<svg
				width={width}
				height={height}
				viewBox="0 0 1024 1024"
				xmlns="http://www.w3.org/2000/svg"
			>
				<title>{title}</title>
				<path
					d="M825.8 498L538.4 249.9c-10.7-9.2-26.4-.9-26.4 14v496.3c0 14.9 15.7 23.2 26.4 14L825.8 526c8.3-7.2 8.3-20.8 0-28zm-320 0L218.4 249.9c-10.7-9.2-26.4-.9-26.4 14v496.3c0 14.9 15.7 23.2 26.4 14L505.8 526c4.1-3.6 6.2-8.8 6.2-14 0-5.2-2.1-10.4-6.2-14z"
					fill={fill}
					transform="rotate(-90 512 512)"
				/>
			</svg>
		);
	},
);
