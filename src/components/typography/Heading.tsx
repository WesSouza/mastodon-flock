import styled, { css } from "styled-components";

const defaultHeadingStyles = css`
  margin-block-end: 1rem;
  font-weight: bold;

  *:not(h1, h2, h3, h4, h5, h6) + & {
    margin-block-start: 2rem;
  }
`;

const Headings = {
  1: styled.h1`
    ${defaultHeadingStyles}
    font-size: 1.6em;
  `,
  2: styled.h2`
    ${defaultHeadingStyles}
    font-size: 1.3em;
  `,
  3: styled.h3`
    ${defaultHeadingStyles}
    font-size: 1.15em;
  `,
  4: styled.h4`
    ${defaultHeadingStyles}
  `,
};

export function Heading({
  anchorName,
  children,
  level = 1,
}: {
  anchorName?: string;
  children: React.ReactNode;
  level?: keyof typeof Headings;
}) {
  const HeadingComponent = Headings[level];
  return <HeadingComponent id={anchorName}>{children}</HeadingComponent>;
}
