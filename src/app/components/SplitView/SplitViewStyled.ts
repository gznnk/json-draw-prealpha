import styled from "@emotion/styled";

// Emotion styled components
export const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

export const Pane = styled.div`
  overflow: auto;
  height: 100%;
`;

export const Divider = styled.div`
  width: 5px;
  cursor: col-resize;
  background-color: transparent;
  position: relative;
  
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 2px;
    width: 1px;
    height: 100%;
    background-color: #3A415C;
  }

  &:hover::after {
    left: 1px;
    width: 3px;
    background-color: #2A3366;
  }
`;
