import styled from "@emotion/styled";

/**
 * Container for the entire chat interface
 */
export const ChatContainer = styled.div<{ width?: string; height?: string }>`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: ${({ width }) => width || "600px"};
  height: ${({ height }) => height || "500px"};
  background-color: #ffffff;
`;

/**
 * Messages display area with scrolling
 */
export const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  scroll-behavior: smooth;
`;

/**
 * Input form area
 */
export const InputContainer = styled.div`
  border-top: 1px solid #e1e1e1;
  padding: 12px;
  display: flex;
  background-color: #f7f7f7;
`;

/**
 * Textarea for message input
 */
export const MessageInput = styled.textarea`
  flex-grow: 1;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 10px 14px;
  resize: none;
  font-family: inherit;
  font-size: 14px;
  min-height: 20px;
  max-height: 120px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #15d1a3;
  }
`;
