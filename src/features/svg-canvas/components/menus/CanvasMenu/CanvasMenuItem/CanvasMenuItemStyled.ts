// Import Emotion for styling.
import styled from "@emotion/styled";

export const CanvasMenuItemDiv = styled.div`
    width: 30px;
    height: 30px;
    color: #D0D4E0;
	box-sizing: border-box;
    border: none;
    padding: 3px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
	transition: background-color 0.2s ease-in-out;
    &:hover {
        background-color: #1F2433;
    }
`;
