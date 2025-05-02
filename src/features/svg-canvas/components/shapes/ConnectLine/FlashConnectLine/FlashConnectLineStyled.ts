// Import Emotion for styling.
import styled from "@emotion/styled";
import { keyframes, css } from "@emotion/react";

/* brightness を一時的に上げて「光ったように」見せる */
const flashBrightness = keyframes`
    0%   { filter: brightness(1); }
    30%  { filter: brightness(2); }
    100% { filter: brightness(1); }
`;

export const FlashGroup = styled.g<{ $flash: boolean }>`
    ${({ $flash }) =>
			$flash &&
			css`
                animation: ${flashBrightness} 0.5s ease-out 1 forwards;
            `}
`;
