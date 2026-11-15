import React from "react";
import { Grid, styled } from "@mui/material";
import { FormField } from "components-care";

export interface FieldsWithImageProps {
  /** fields in the left column, top to bottom */
  fields: string[];
  /** image field in the right column */
  imageField: string;
}

// keeps the image preview at logo size instead of the full column width
const ImageCell = styled(Grid)({
  "& img": {
    maxHeight: 200,
  },
});

/**
 * Form fields left (2/3) and the image right (1/3) on desktop, like the
 * facility data form in samedis.care; on phones the image comes below.
 */
const FieldsWithImage = (props: FieldsWithImageProps) => (
  <Grid container spacing={2} size={12}>
    <Grid
      container
      spacing={2}
      size={{ xs: 12, md: 8 }}
      sx={{ alignContent: "flex-start" }}
    >
      {props.fields.map((field) => (
        <Grid key={field} size={12}>
          <FormField name={field} />
        </Grid>
      ))}
    </Grid>
    <ImageCell size={{ xs: 12, md: 4 }}>
      <FormField name={props.imageField} />
    </ImageCell>
  </Grid>
);

export default React.memo(FieldsWithImage);
