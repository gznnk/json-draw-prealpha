// Import React.
import { memo } from "react";

// Import Emotion.
import { css, keyframes } from "@emotion/react";
import styled from "@emotion/styled";

/**
 * Animation for flash brightness effect
 */
const flashBrightness = keyframes`
    0%   { filter: brightness(1); }
    30%  { filter: brightness(2); }
    100% { filter: brightness(1); }
`;

/**
 * Styled component for flash effect group
 */
export const FlashGroup = styled.g<{ $flash: boolean }>`
    ${({ $flash }) =>
			$flash &&
			css`
            animation: ${flashBrightness} 0.5s ease-out 1 forwards;
        `}
`;

/**
 * Props for VectorStore icon
 */
type VectorStoreProps = {
	width?: number;
	height?: number;
	animation?: boolean;
};

/**
 * Vector Store icon component
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
						cy="30"
						rx="30"
						ry="12"
						fill="#fff"
						stroke="#333"
						strokeWidth="1.5"
					/>
					<path
						d="M20 30v43c0 6.6 13.5 12 30 12s30-5.4 30-12V30"
						fill="none"
						stroke="#333"
						strokeWidth="1.5"
					/>
				</FlashGroup>
			</svg>
		);
	},
);
