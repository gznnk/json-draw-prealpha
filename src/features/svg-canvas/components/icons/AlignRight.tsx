import { memo } from "react";

type AlignRightProps = {
	width?: number;
	height?: number;
	fill?: string;
	title?: string;
};

export const AlignRight = memo<AlignRightProps>(
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
					d="M904 158H408c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h496c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 424H408c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h496c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 212H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0-424H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z"
					fill={fill}
				/>
			</svg>
		);
	},
);
