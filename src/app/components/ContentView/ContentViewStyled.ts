import styled from "@emotion/styled";

/**
 * Root element of the content view
 * Wraps the entire content area
 */
export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: #1A1F33; // Dark navy (Section Background)
  color: #C0C4D2; // Light gray with blue tint (Primary Text)
  overflow: auto;
  padding: 0;
  position: relative;
`;

/**
 * Message shown when no content is available
 */
export const EmptyContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666B82; // Dark gray with blue tint (Placeholder Text)
  font-style: italic;
`;
