// SampleContentStyled.ts
import styled from "@emotion/styled";

export const SampleContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
  border-radius: 4px;
  overflow: auto;
  
  h2 {
    margin-top: 0;
    margin-bottom: 16px;
    color: #333;
    font-size: 20px;
  }
  
  p {
    color: #555;
    line-height: 1.5;
  }
`;
