import { createTheme, ThemeOptions } from "@mui/material";
import { TypographyVariantsOptions } from "@mui/material/styles";
import { BackButtonDefaultColorClass, deepClone } from "components-care";
import ImFormPageLayout, {
  ImInlineFormButtonsClassName,
  ImPhoneFormButtonsClassName,
} from "./components-care/ImFormPageLayout";

declare module "@mui/material/styles" {
  interface TypeBackground {
    advanced?: string | null; // background CSS property
  }
  interface Palette {
    brand: BrandColors;
  }
  interface PaletteOptions {
    brand?: BrandColors;
  }
}

/**
 * IM brand colors that have no MUI palette slot
 */
export interface BrandColors {
  /** top bar background: white (light), navy (dark), like samedis.care */
  top: string;
  /** text and icons on the top bar */
  topText: string;
  /** muted text on the top bar */
  topMuted: string;
  /** dividers on the top bar */
  topDivider: string;
  /** hover background on the top bar */
  topHover: string;
  /** accent for indicators, focus and switches; too light for text on white */
  accent: string;
  /** soft accent background */
  accentSoft: string;
  /** gradient line below the top bar */
  topLine: string;
  /** page background behind the content panel, like the samedis.care portal body */
  pageGradient: string;
  /** data grid row background, like lighterBlue in samedis.care */
  row: string;
  /** selected data grid row */
  rowSelected: string;
}

const TOP_LINE = "linear-gradient(90deg, #0869B3 0%, #00AFC3 100%)";

const light = {
  mode: "light" as const,
  primary: { main: "#00788A", contrastText: "#FFFFFF" },
  secondary: { main: "#002D50", contrastText: "#FFFFFF" },
  error: { main: "#C8213C" },
  warning: { main: "#F2B400", contrastText: "#14212B" },
  success: { main: "#2E7D32" },
  info: { main: "#0869B3" },
  background: { default: "#FFFFFF", paper: "#FFFFFF" },
  text: { primary: "#14212B", secondary: "#3E4A55", disabled: "#6B7885" },
  divider: "#E5EAF2",
  brand: {
    top: "#FFFFFF",
    topText: "#002D50",
    topMuted: "#5B7083",
    topDivider: "rgba(0,45,80,0.15)",
    topHover: "rgba(0,45,80,0.05)",
    accent: "#00AFC3",
    accentSoft: "#E0F6F9",
    topLine: TOP_LINE,
    pageGradient:
      "linear-gradient(270deg, #00AFC3 0%, #0869B3 60%, #0A4F86 100%)",
    row: "#DDF0F5",
    rowSelected: "#B5DEEA",
  },
};

const dark = {
  mode: "dark" as const,
  primary: { main: "#3FD0E0", contrastText: "#071320" },
  secondary: { main: "#9FB6C9", contrastText: "#071320" },
  error: { main: "#FF6B81" },
  warning: { main: "#FFD36B" },
  success: { main: "#7BD88A" },
  info: { main: "#6FB7F0" },
  background: { default: "#0B1A26", paper: "#12263A" },
  text: { primary: "#EAF1F6", secondary: "#C3D0DB", disabled: "#8DA1B2" },
  divider: "#223A50",
  brand: {
    top: "#071320",
    topText: "#FFFFFF",
    topMuted: "#8DA1B2",
    topDivider: "rgba(255,255,255,0.2)",
    topHover: "rgba(255,255,255,0.06)",
    accent: "#00AFC3",
    accentSoft: "#0E3A47",
    topLine: TOP_LINE,
    pageGradient:
      "linear-gradient(270deg, #005E6B 0%, #0B3558 60%, #0B1A26 100%)",
    row: "#173248",
    rowSelected: "#1F4A63",
  },
};

const defaultTheme = createTheme();

// samedis.care typography: 13px base, Roboto Condensed headings
const CONDENSED = '"Roboto Condensed", "Roboto", sans-serif';
const typography: TypographyVariantsOptions = {
  fontSize: 13,
  h1: {
    fontSize: "2rem",
    fontWeight: 700,
    letterSpacing: 0,
    fontFamily: CONDENSED,
  },
  h2: {
    fontSize: "1rem",
    fontWeight: 700,
    letterSpacing: 0,
    fontFamily: CONDENSED,
  },
  h3: {
    fontSize: "0.8125rem",
    fontWeight: 700,
    letterSpacing: 0,
    fontFamily: CONDENSED,
  },
  subtitle1: {
    fontWeight: 500,
    fontSize: "1rem",
    letterSpacing: -0.21,
    lineHeight: 1.43,
  },
  subtitle2: {
    fontWeight: 500,
    fontSize: "0.8125rem",
    letterSpacing: -0.17,
    lineHeight: 1.43,
  },
  body1: { fontWeight: 400, fontSize: "0.8125rem", letterSpacing: 0.16 },
  body2: { fontWeight: 400, fontSize: "0.75rem", letterSpacing: 0.11 },
  caption: { fontWeight: 400, fontSize: "0.75rem", letterSpacing: 0.14 },
  button: {
    textTransform: "none",
    fontWeight: 400,
    fontSize: "0.8125rem",
    letterSpacing: 0.16,
  },
  overline: {
    textTransform: "none",
    fontWeight: 400,
    fontSize: "0.8125rem",
    letterSpacing: 0.16,
  },
};

const BORDER_RADIUS = 5;

export const getTheme = (preferDark: boolean): ThemeOptions => {
  // a copy per call: callers merge app palettes into the result (deepAssign
  // in AuthPageLayout writes into the objects it is given)
  const palette = deepClone(preferDark ? dark : light);
  return {
    shape: { borderRadius: BORDER_RADIUS },
    typography,
    palette,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            fontSize: "0.8125rem",
            lineHeight: 1.43,
            letterSpacing: "0.01071em",
          },
        },
      },
      MuiTextField: {
        defaultProps: { variant: "standard" },
      },
      MuiSelect: {
        defaultProps: { variant: "standard" },
      },
      MuiInputLabel: {
        styleOverrides: { root: { fontSize: "1rem" } },
      },
      MuiFormHelperText: {
        styleOverrides: { root: { fontSize: "0.75rem" } },
      },
      // tabs like samedis.care: spread across the box (fullWidth), scrolling
      // when there are too many for the width
      MuiTabs: {
        defaultProps: {
          indicatorColor: "primary",
          textColor: "primary",
          variant: "scrollable",
          scrollButtons: false,
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            ...typography.subtitle1,
            flex: "1 0 auto",
            maxWidth: "none",
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { whiteSpace: "nowrap" } },
      },
      MuiIconButton: {
        defaultProps: { color: "primary" },
      },
      MuiPopover: {
        defaultProps: {
          slotProps: {
            paper: {
              elevation: 0,
              style: { border: "1px solid " + palette.divider },
            },
          },
        },
      },
      // dialogs like samedis.care: h2 title, 8px margin on phones, dark backdrop
      MuiDialog: {
        styleOverrides: {
          paper: {
            [defaultTheme.breakpoints.down("sm")]: {
              margin: 8,
              width: "calc(100% - 16px)",
              maxHeight: "calc(100% - 16px)",
            },
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: { root: { ...typography.h2 } },
      },
      MuiModal: {
        styleOverrides: {
          backdrop: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
        },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundColor: palette.brand.top,
            color: palette.brand.topText,
            backgroundImage: "none",
            // tab bars inside a page (static) sit flush at the top of the
            // white box: no navy bar there, just the tabs
            "&.MuiAppBar-positionStatic": {
              backgroundColor: "transparent",
              color: palette.text.primary,
            },
          },
        },
      },
      // CC Start
      CcActionButton: {
        styleOverrides: {
          button: {
            padding: "7px 25px",
            borderRadius: 25,
            fontSize: "0.75rem",
            border: "none",
            "&.Mui-disabled": {
              backgroundColor: palette.mode === "dark" ? "#35506A" : "#BCBDBF",
              border: "none",
            },
            "&.MuiButton-contained": { borderRadius: 25 },
          },
        },
      },
      CcPortalLayoutMenu: {
        styleOverrides: {
          menuPaper: {
            borderRadius: 0,
            boxShadow: "none",
            borderRight: "1px solid " + palette.divider,
            paddingTop: 8,
          },
        },
      },
      CcMenuItemMaterial: {
        styleOverrides: {
          root: {
            borderLeft: "3px solid transparent",
            paddingTop: 10,
            paddingBottom: 10,
            color: palette.text.secondary,
            "& .MuiListItemIcon-root": { minWidth: 40, color: "inherit" },
            "& .MuiListItemText-primary": { fontSize: "0.875rem" },
            "&.Mui-selected, &.Mui-selected:hover": {
              borderLeftColor: palette.brand.accent,
              backgroundColor: palette.brand.accentSoft,
              color:
                palette.mode === "dark"
                  ? palette.text.primary
                  : palette.secondary.main,
            },
            "&.Mui-selected .MuiListItemText-primary": { fontWeight: 500 },
          },
        },
      },
      // like samedis.care: the back/cancel button in primary, not MUI grey;
      // on phones the menu leads back, so the form shows no back button
      CcDefaultFormPageButtons: {
        styleOverrides: {
          backButton: {
            [`&.${BackButtonDefaultColorClass}:not(.Mui-disabled)`]: {
              backgroundColor: palette.primary.main,
              color: palette.primary.contrastText,
            },
            [`.${ImPhoneFormButtonsClassName} &`]: {
              display: "none",
            },
          },
        },
      },
      // form pages like samedis.care: button bar fixed at the bottom on
      // desktop, last in the box on phones and in dialogs (ImFormPageLayout)
      CcBasicFormPage: {
        defaultProps: {
          formPageLayoutComponent: ImFormPageLayout,
        },
      },
      CcFormButtons: {
        styleOverrides: {
          buttonWrapper: {
            margin: "0 25px 0 0",
            [`.${ImInlineFormButtonsClassName} &`]: {
              margin: "0 16px 0 0",
            },
          },
          root: {
            width: "auto",
            border: "none",
            borderRadius: 0,
            padding: "8px 32px",
            margin: "-8px 0",
            backgroundColor:
              palette.mode === "dark"
                ? "rgba(18, 38, 58, 0.55)"
                : "rgba(185, 215, 240, 0.35)",
            boxShadow:
              palette.mode === "dark"
                ? "rgba(18, 38, 58, 0.55) 10px 10px 10px 6px"
                : "rgba(185, 215, 240, 0.35) 10px 10px 10px 6px",
            backdropFilter: "blur(30px) opacity(0.7)",
            [`.${ImInlineFormButtonsClassName} &`]: {
              backgroundColor: "unset",
              boxShadow: "unset",
              backdropFilter: "unset",
              padding: 0,
              margin: 0,
            },
          },
        },
      },
      CcGroupBox: {
        styleOverrides: {
          root: {
            borderColor: palette.divider,
            borderRadius: BORDER_RADIUS,
          },
          legend: {
            fontSize: "0.75rem",
            letterSpacing: 0.1,
            color: palette.text.secondary,
          },
        },
      },
      CcFormPageLayout: {
        styleOverrides: { root: { padding: 0 } },
      },
      CcDataGrid: {
        styleOverrides: {
          root: { border: "none" },
          header: {
            borderWidth: "0 0 0 0",
            padding: "0 0 15px 0",
            marginTop: 2,
          },
          cell: {
            borderWidth: "0 0 1px 0",
            "&.CcDataGrid-dataCell": {
              borderColor: palette.background.paper,
              backgroundColor: palette.brand.row,
            },
            "&.CcDataGrid-dataCellSelected": {
              backgroundColor: palette.brand.rowSelected,
            },
            "&.CcDataGrid-headerCell": { borderWidth: 0 },
          },
          footer: { padding: "15px 0 0 0" },
          columnHeaderContentWrapper: { fontSize: "0.75rem", fontWeight: 500 },
          columnHeaderResizer: {
            borderWidth: "0 1px 0 0",
            top: "2px",
            height: "calc(100% - 13px)",
          },
        },
      },
    },
  };
};
