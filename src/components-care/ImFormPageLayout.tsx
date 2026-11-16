/*
 * Form page layout like SamedisFormPageLayout in samedis-care-frontend:
 * - desktop: the button bar is absolutely positioned at the bottom of the
 *   content area (the account layout makes that the containing block), across
 *   its full width; the page scrolls underneath, the body keeps 90px free at
 *   the end so the last fields clear the bar
 * - phone and form dialogs: the buttons come last inside the box, in the flow
 * The CcFormButtons theme override styles both variants.
 */
import React, { useContext } from "react";
import { styled, useMediaQuery, useTheme } from "@mui/material";
import { combineClassNames } from "components-care";
import { FormPageLayoutProps } from "components-care/dist/standalone/Form/FormPageLayout";
import { IsInFormDialogContext } from "components-care/dist/backend-components/Form/FormDialog";

/** class of the wrapper of the in-flow buttons (phone, dialog) */
export const ImInlineFormButtonsClassName = "ImInlineFormButtons";
/** additional class of that wrapper on phones (not in dialogs) */
export const ImPhoneFormButtonsClassName = "ImPhoneFormButtons";
/** class of the layout root, lets the page frame tell form pages from grids */
export const ImFormPageLayoutClassName = "ImFormPageLayout";

const Root = styled("div", { name: "ImFormPageLayout", slot: "root" })({
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  width: "100%",
});

const Body = styled("div", { name: "ImFormPageLayout", slot: "body" })({
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  paddingBottom: 90,
  "&.ImFormPageLayout-noBarSpace": {
    paddingBottom: 0,
  },
});

const Footer = styled("div", { name: "ImFormPageLayout", slot: "footer" })(
  ({ theme }) => ({
    position: "absolute",
    padding: 0,
    bottom: theme.spacing(1),
    width: "100%",
    left: 0,
    zIndex: 10,
  }),
);

const InlineFooter = styled("div", {
  name: "ImFormPageLayout",
  slot: "inlineFooter",
})(({ theme }) => ({
  marginTop: theme.spacing(2),
  // on phones the buttons sit at the end of the box, inside its padding;
  // dialogs bring their own padding
  [`&.${ImPhoneFormButtonsClassName}`]: {
    padding: theme.spacing(0, 2, 2),
  },
}));

const ImFormPageLayout = (props: FormPageLayoutProps) => {
  const { body, footer, other, className, classes } = props;
  const theme = useTheme();
  const phone = useMediaQuery(theme.breakpoints.only("xs"));
  const inDialog = useContext(IsInFormDialogContext);
  const inline = phone || inDialog;

  return (
    <Root
      className={combineClassNames([
        ImFormPageLayoutClassName,
        className,
        classes?.root,
      ])}
    >
      <Body
        className={combineClassNames([
          (inline || !footer) && "ImFormPageLayout-noBarSpace",
          classes?.body,
        ])}
      >
        {body}
        {inline && footer && (
          <InlineFooter
            className={combineClassNames([
              ImInlineFormButtonsClassName,
              phone && !inDialog && ImPhoneFormButtonsClassName,
            ])}
          >
            {footer}
          </InlineFooter>
        )}
      </Body>
      {!inline && footer && (
        <Footer className={classes?.footer}>{footer}</Footer>
      )}
      {other}
    </Root>
  );
};

export default React.memo(ImFormPageLayout);
