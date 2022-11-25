import original from "react95/dist/themes/original";
import { ThemeProvider } from "styled-components";

export type React95Props = {
  children?: React.ReactNode;
};

export function React95({ children }: React95Props) {
  return <ThemeProvider theme={original}>{children}</ThemeProvider>;
}
