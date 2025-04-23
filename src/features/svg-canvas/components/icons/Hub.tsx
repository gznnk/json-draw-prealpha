import { memo } from "react";
import styled from "@emotion/styled";
import { keyframes, css } from "@emotion/react";

const flashBrightness = keyframes`
    0%   { filter: brightness(1); }
    30%  { filter: brightness(2.5); }
    100% { filter: brightness(1); }
`;

export const FlashLine = styled.line<{ $flash: boolean }>`
    ${({ $flash }) =>
			$flash &&
			css`
            animation: ${flashBrightness} 0.5s ease-out 1 forwards;
        `}
`;

type HubProps = {
	flash?: boolean;
};

export const Hub = memo(({ flash = false }: HubProps) => {
	return (
		<>
			<FlashLine
				x1="50"
				y1="40"
				x2="50"
				y2="10"
				stroke="#fed579"
				strokeWidth="3"
				$flash={flash}
			/>
			<FlashLine
				x1="60"
				y1="50"
				x2="90"
				y2="50"
				stroke="#fed579"
				strokeWidth="3"
				$flash={flash}
			/>
			<FlashLine
				x1="50"
				y1="60"
				x2="50"
				y2="90"
				stroke="#fed579"
				strokeWidth="3"
				$flash={flash}
			/>
			<FlashLine
				x1="40"
				y1="50"
				x2="10"
				y2="50"
				stroke="#fed579"
				strokeWidth="3"
				$flash={flash}
			/>
			<FlashLine
				x1="56.5"
				y1="43.5"
				x2="80"
				y2="20"
				stroke="#fed579"
				strokeWidth="3"
				$flash={flash}
			/>
			<FlashLine
				x1="56.5"
				y1="56.5"
				x2="80"
				y2="80"
				stroke="#fed579"
				strokeWidth="3"
				$flash={flash}
			/>
			<FlashLine
				x1="43.5"
				y1="43.5"
				x2="20"
				y2="20"
				stroke="#fed579"
				strokeWidth="3"
				$flash={flash}
			/>
			<FlashLine
				x1="43.5"
				y1="56.5"
				x2="20"
				y2="80"
				stroke="#fed579"
				strokeWidth="3"
				$flash={flash}
			/>
			<circle cx="50" cy="10" r="5" fill="#ffffff" />
			<circle cx="90" cy="50" r="5" fill="#ffffff" />
			<circle cx="50" cy="90" r="5" fill="#ffffff" />
			<circle cx="10" cy="50" r="5" fill="#ffffff" />
			<circle cx="80" cy="20" r="5" fill="#ffffff" />
			<circle cx="80" cy="80" r="5" fill="#ffffff" />
			<circle cx="20" cy="20" r="5" fill="#ffffff" />
			<circle cx="20" cy="80" r="5" fill="#ffffff" />
			<circle cx="50" cy="50" r="20" fill="#4AA6B6" />
		</>
	);
});
