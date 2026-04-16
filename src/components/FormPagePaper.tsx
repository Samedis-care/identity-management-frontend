import React from "react";
import { Box, Paper, styled } from "@mui/material";

export interface FormPagePaperProps {
  noOuterPadding?: boolean;
  children: React.ReactNode;
}

const flexGrowStyles = {
  display: "flex",
  flexGrow: 1,
  flexDirection: "column",
} as const;

const FlexGrowBox = styled(Box)(flexGrowStyles);
const StyledPaper = styled(Paper)(flexGrowStyles);

const FormPagePaper = (props: FormPagePaperProps) => {
  return (
    <FlexGrowBox p={props.noOuterPadding ? 0 : 2}>
      <StyledPaper>
        <FlexGrowBox p={2}>{props.children}</FlexGrowBox>
      </StyledPaper>
    </FlexGrowBox>
  );
};

export default React.memo(FormPagePaper);
