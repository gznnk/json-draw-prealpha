import styled from "@emotion/styled";

/**
 * Container for the entire chat interface
 */
export const ChatContainer = styled.div<{ width?: string; height?: string }>`
  background-color: #0C0F1C;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: ${({ width }) => width || "600px"};
  height: ${({ height }) => height || "500px"};
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
  padding: 12px;
  display: flex;
  background-color: #0C0F1C;
`;

/**
 * Textarea for message input
 */
export const MessageInput = styled.textarea`
  flex-grow: 1;
  background-color: #0C0F1C;
  border: 3px solid #2A2F4C;
  border-radius: 6px;
  padding: 10px 14px;
  resize: none;
  font-family: inherit;
  font-size: 14px;
  min-height: 20px;
  max-height: 120px;
  outline: none;
  transition: border-color 0.2s;
  color: #B0B0B0;
  caret-color: #B0B0B0;

  &:focus {
    border-color: #3A4160;
  }
  &::placeholder {
    color: #666B82;
  }
`;
