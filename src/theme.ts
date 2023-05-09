import { ThemeOptions } from "@mui/material";
import { ComponentsCareTheme } from "components-care";

const palette = {
  primary: {
    main: "#425159",
  },
  secondary: {
    main: "#eb6a28",
  },
  background: {
    default: "#bad8f0",
    paper: "#FFF",
  },
};

const cc: ComponentsCareTheme = {
  dataGrid: {
    border: "none",
    header: {
      borderWidth: "0 0 0 0",
      padding: "0 0 15px 0",
    },
    content: {
      row: {
        cell: {
          header: {
            borderWidth: "0 0 1px 0",
            label: {
              fontSize: "0.75rem",
              fontWeight: 500,
            },
            resizer: {
              borderWidth: "0 1px 0 0",
              style: {
                top: "2px",
                height: "calc(100% - 13px)",
              },
            },
          },
          data: {
            borderWidth: "0 0 1px 0",
          },
        },
      },
    },
    footer: {
      padding: "15px 0 0 0",
    },
  },
  uiKit: {
    actionButton: {
      backgroundColor: palette.secondary.main,
    },
    formPage: {
      layout: {
        box: {
          padding: 0,
        },
      },
    },
  },
};

export const getTheme = (preferDark: boolean): ThemeOptions => ({
  typography: {
    h1: { fontSize: "1.5rem", fontWeight: 700 },
    h2: { fontSize: "1.25rem", fontWeight: 700 },
    h3: { fontSize: "1.2rem", fontWeight: 700 },
    h4: { fontSize: "1.15rem", fontWeight: 700 },
    h5: { fontSize: "1.1rem", fontWeight: 700 },
    h6: { fontSize: "1.05rem", fontWeight: 700 },
  },
  palette,
  components: {
    MuiTextField: {
      defaultProps: {
        variant: "standard",
      },
    },
    MuiSelect: {
      defaultProps: {
        variant: "standard",
      },
    },
    MuiTabs: {
      defaultProps: {
        indicatorColor: "secondary",
        textColor: "inherit",
      },
    },
  },
  // @ts-ignore
  componentsCare: cc,
});
