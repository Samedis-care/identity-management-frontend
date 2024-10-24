import React from "react";
import * as marked from "marked";
import { renderToStaticMarkup } from "react-dom/server";
import {
  createTheme,
  Link,
  StyledEngineProvider,
  ThemeProvider,
  Typography,
} from "@mui/material";
import { getTheme } from "../theme";
import { Variant } from "@mui/material/styles/createTypography";

const renderer: marked.RendererObject = {
  heading({ depth: level, tokens }: marked.Tokens.Heading): string {
    const text = this.parser.parseInline(tokens);
    return renderToStaticMarkup(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={createTheme(getTheme(false))}>
          <Typography
            variant={`h${level}` as Variant}
            dangerouslySetInnerHTML={{ __html: text }}
          />
        </ThemeProvider>
      </StyledEngineProvider>,
    );
  },
  link({ href, title, text }: marked.Tokens.Link): string {
    return renderToStaticMarkup(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={createTheme(getTheme(false))}>
          <Link
            href={href ?? undefined}
            title={title ?? undefined}
            dangerouslySetInnerHTML={{ __html: text }}
            target={"_blank"}
          />
        </ThemeProvider>
      </StyledEngineProvider>,
    );
  },
  text({
    text,
  }: marked.Tokens.Text | marked.Tokens.Escape | marked.Tokens.Tag): string {
    return renderToStaticMarkup(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={createTheme(getTheme(false))}>
          <Typography
            component={"span"}
            dangerouslySetInnerHTML={{ __html: text }}
          />
        </ThemeProvider>
      </StyledEngineProvider>,
    );
  },
};

export default renderer;
