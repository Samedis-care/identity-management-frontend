import { marked } from "marked";
import { renderToStaticMarkup } from "react-dom/server";
import {
  adaptV4Theme,
  createTheme,
  Link,
  StyledEngineProvider,
  ThemeProvider,
  Typography,
} from "@mui/material";
import { getTheme } from "../theme";
import { Variant } from "@mui/material/styles/createTypography";

const renderer: marked.RendererObject = {
  heading(
    _text: string,
    level: 1 | 2 | 3 | 4 | 5 | 6,
    raw: string,
    _slugger: marked.Slugger,
  ): string {
    return renderToStaticMarkup(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={createTheme(adaptV4Theme(getTheme(false)))}>
          <Typography variant={`h${level}` as Variant}>{raw}</Typography>
        </ThemeProvider>
      </StyledEngineProvider>,
    );
  },
  link(href: string | null, title: string | null, text: string): string {
    return renderToStaticMarkup(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={createTheme(adaptV4Theme(getTheme(false)))}>
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
  text(text: string): string {
    return renderToStaticMarkup(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={createTheme(adaptV4Theme(getTheme(false)))}>
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
