// Import React.
import { memo } from "react";

/**
 * Props for Italic icon
 */
type ItalicProps = {
	width?: number;
	height?: number;
	title?: string;
	fill?: string;
};

/**
 * Italic icon component
 */
export const Italic = memo<ItalicProps>(
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
					d="M798 160H366c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h181.2l-156 480H229c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h432c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8H474.4l156-480H798c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8z"
					fill={fill}
				/>
			</svg>
		);
	},
);
