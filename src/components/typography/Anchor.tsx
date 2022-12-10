import styled from "styled-components";

export const Anchor = styled.a`
  color: ${({ theme }) => theme.anchor};
  text-decoration: underline;
`;

export const ButtonAnchor = styled.button`
  color: ${({ theme }) => theme.anchor};
  text-decoration: underline;
  appearance: none;
  border: 0;
  padding: 0;
  cursor: pointer;
  background: none;
  font-size: inherit;
`;
