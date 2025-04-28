import { memo } from "react";

type MinusProps = {
	fill?: string;
	width?: number;
	height?: number;
};

export const Minus = memo<MinusProps>(
	({ fill = "#333333", width = 24, height = 24 }) => {
		return (
			<svg
				width={width}
				height={height}
				viewBox="0 0 1024 1024"
				xmlns="http://www.w3.org/2000/svg"
			>
				<title>Minus</title>
				<path
					d="M872 474H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h720c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z"
					fill={fill}
				/>
			</svg>
		);
	},
);
