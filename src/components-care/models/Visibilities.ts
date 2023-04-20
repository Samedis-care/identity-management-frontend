import {
  ModelVisibilityDisabledReadOnly,
  ModelVisibilityHidden,
  PageVisibility,
} from "components-care";

export const BackendVisibility: PageVisibility = {
  overview: ModelVisibilityDisabledReadOnly,
  create: ModelVisibilityHidden,
  edit: ModelVisibilityHidden,
};
