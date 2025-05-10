import styled from "@emotion/styled";

/**
 * Main container for the sheets component
 */
export const SheetsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  position: relative;
`;

/**
 * Container for sheet content that uses absolute positioning
 */
export const SheetContentContainer = styled.div`
  position: relative;
  flex: 1;
  overflow: hidden;
`;

/**
 * Sheet bar that appears at the bottom of the container
 */
export const SheetBar = styled.div`
  display: flex;
  background-color: #121624;
  border-top: 1px solid #3A415C;
`;

/**
 * Individual sheet button
 */
export const SheetButton = styled.button<{ isActive: boolean }>`
  padding: 8px 16px;
  background-color: ${(props) => (props.isActive ? "#1A1E2F" : "#121624")};
  border: none;
  border-right: 1px solid #3A415C;
  border-top: ${(props) => (props.isActive ? "3px solid #3A415C" : "2px solid transparent")};
  cursor: pointer;
  outline: none;
  font-size: 13px;
  color: ${(props) => (props.isActive ? "#E0E4F0" : "#C0C4D2")};
  transition: background-color 0.2s, color 0.2s;
  
  &:hover {
    background-color: ${(props) => (props.isActive ? "#222638" : "#1F2433")};
  }
  
  &:first-of-type {
    border-left: none;
  }
`;

/**
 * Add sheet button that appears at the end of sheet bar
 */
export const AddSheetButton = styled.button`
  padding: 8px 12px;
  background-color: #121624;
  border: none;
  cursor: pointer;
  outline: none;
  font-size: 14px;
  color: #C0C4D2;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #1F2433;
  }
`;
