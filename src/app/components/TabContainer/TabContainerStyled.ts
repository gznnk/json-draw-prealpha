import styled from "@emotion/styled";

/**
 * Main container for the tab component
 */
export const TabContainerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  position: relative;
`;

/**
 * Container for tab content that uses absolute positioning
 */
export const TabContentContainer = styled.div`
  position: relative;
  flex: 1;
  overflow: hidden;
`;

/**
 * Tab bar that appears at the bottom of the container
 */
export const TabBar = styled.div`
  display: flex;
  background-color: #f0f0f0;
  border-top: 1px solid #ccc;
`;

/**
 * Individual tab button
 */
export const TabButton = styled.button<{ isActive: boolean }>`
  padding: 8px 16px;
  background-color: ${(props) => (props.isActive ? "#fff" : "#f0f0f0")};
  border: none;
  border-right: 1px solid #ccc;
  border-top: ${(props) => (props.isActive ? "2px solid #0078d4" : "2px solid transparent")};
  cursor: pointer;
  outline: none;
  font-size: 13px;
  color: ${(props) => (props.isActive ? "#0078d4" : "#333")};
  transition: background-color 0.2s, color 0.2s;
  
  &:hover {
    background-color: ${(props) => (props.isActive ? "#fff" : "#e0e0e0")};
  }
  
  &:first-of-type {
    border-left: none;
  }
`;

/**
 * Add tab button that appears at the end of tab bar
 */
export const AddTabButton = styled.button`
  padding: 8px 12px;
  background-color: #f0f0f0;
  border: none;
  border-left: 1px solid #ccc;
  cursor: pointer;
  outline: none;
  font-size: 14px;
  color: #0078d4;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;
