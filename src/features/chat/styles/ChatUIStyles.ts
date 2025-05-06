import styled from "@emotion/styled";
import { css } from "@emotion/react";

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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
    border-color: #10a37f;
  }
`;

/**
 * Send button with different states (disabled, loading)
 */
export const SendButton = styled.button<{ isDisabled: boolean }>`
  background-color: #10a37f;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0 16px;
  margin-left: 8px;
  font-weight: 600;
  cursor: ${({ isDisabled }) => (isDisabled ? "not-allowed" : "pointer")};
  opacity: ${({ isDisabled }) => (isDisabled ? "0.6" : "1")};
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background-color: #0d8c6d;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

/**
 * Loading indicator animation
 */
export const loadingAnimation = css`
  @keyframes pulse {
    0% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.6;
    }
  }
`;

/**
 * Loading indicator component
 */
export const LoadingIndicator = styled.div`
  ${loadingAnimation}
  display: flex;
  align-items: center;
  padding: 12px 18px;
  border-radius: 8px;
  margin: 8px 0;
  align-self: flex-start;
  font-style: italic;
  color: #666;
  animation: pulse 1.5s infinite;

  &::after {
    content: "...";
    font-weight: bold;
  }
`;
