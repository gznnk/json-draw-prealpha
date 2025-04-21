// Import Emotion for styling.
import styled from "@emotion/styled";

export const TextAreaButton = styled.rect`
    cursor: pointer;
    transition: filter 0.2s ease;
    &:hover {
        opacity: 0.7;
    }
    &:active {
        filter: brightness(0.7);
    }
`;

export const TextAreaButtonText = styled.text`
    user-select: none;
`;
