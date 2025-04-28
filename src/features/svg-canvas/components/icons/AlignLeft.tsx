import { memo } from "react";

type AlignLeftProps = {
	fill?: string;
	width?: number;
	height?: number;
};

export const AlignLeft = memo<AlignLeftProps>(
	({ fill = "#333333", width = 24, height = 24 }) => {
		return (
			<svg
				width={width}
				height={height}
				viewBox="0 0 1024 1024"
				xmlns="http://www.w3.org/2000/svg"
			>
				<title>AlignLeft</title>
				<path
					d="M120 230h496c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm0 424h496c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm784 140H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0-424H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z"
					fill={fill}
				/>
			</svg>
		);
	},
);
