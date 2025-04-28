import { memo } from "react";

type PlusProps = {
	fill?: string;
	width?: number;
	height?: number;
};

export const Plus = memo<PlusProps>(
	({ fill = "#333333", width = 24, height = 24 }) => {
		return (
			<svg
				width={width}
				height={height}
				viewBox="0 0 1024 1024"
				xmlns="http://www.w3.org/2000/svg"
			>
				<title>Plus</title>
				<path
					d="M474 152m8 0l60 0q8 0 8 8l0 704q0 8-8 8l-60 0q-8 0-8-8l0-704q0-8 8-8Z"
					fill={fill}
				/>
				<path
					d="M168 474m8 0l672 0q8 0 8 8l0 60q0 8-8 8l-672 0q-8 0-8-8l0-60q0-8 8-8Z"
					fill={fill}
				/>
			</svg>
		);
	},
);
