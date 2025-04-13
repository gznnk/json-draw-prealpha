// Import Emotion for styling.
import styled from "@emotion/styled";

export const DiagramMenuControlPositioner = styled.div`
    position: absolute;
	left: 50%;
	top: 32px;
`;

export const DiagramMenuControlContainer = styled.div`
	height: 100%;
    margin: 0 -100px;
	display: flex;
	align-items: center;
	flex-direction: column;
	justify-content: top;
	pointer-events: none;
`;
