// Import Emotion for styling.
import styled from "@emotion/styled";

type RectangleWrapperProps = {
	visible: boolean;
};

export const RectangleWrapper = styled.g<RectangleWrapperProps>`
    & rect.diagram {
        opacity: ${(props) => (props.visible ? 1 : 0)};
    }
    & foreignObject.diagram {
        opacity: ${(props) => (props.visible ? 1 : 0)};
    }
`;
