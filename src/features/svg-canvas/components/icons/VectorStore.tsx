// Import React.
import { memo } from "react";

// Import Emotion for styling.
import styled from "@emotion/styled";
import { keyframes, css } from "@emotion/react";

/**
 * Animation for the flashing effect.
 */
const flashBrightness = keyframes`
    0%   { filter: brightness(1); }
    30%  { filter: brightness(2); }
    100% { filter: brightness(1); }
`;

/**
 * Styled component for the group of flash.
 */
export const FlashGroup = styled.g<{ $flash: boolean }>`
    ${({ $flash }) =>
			$flash &&
			css`
            animation: ${flashBrightness} 0.5s ease-out 1 forwards;
        `}
`;

/**
 * Props for the VectorStore icon.
 */
type VectorStoreProps = {
	width?: number;
	height?: number;
	animation?: boolean;
};

/**
 * VectorStore component that renders a vector store icon.
 */
export const VectorStore = memo<VectorStoreProps>(
	({ width = 80, height = 80, animation = false }) => {
		return (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width={width}
				height={height}
				viewBox="0 0 100 100"
			>
				<title>Vector Store</title>
				<rect
					x="0"
					y="0"
					width="100"
					height="100"
					rx="15"
					ry="15"
					fill="#f0f0f0"
				/>
				<FlashGroup $flash={animation}>
					<ellipse
						cx="50"
						cy="42"
						rx="20"
						ry="8"
						fill="#fff"
						stroke="#333"
						strokeWidth="1.5"
					/>
					<path
						d="M30 42v16c0 4.4 9 8 20 8s20-3.6 20-8V42"
						fill="none"
						stroke="#333"
						strokeWidth="1.5"
					/>
				</FlashGroup>
			</svg>
		);
	},
);
