import {
  ModelDataTypeImageRenderer,
  ModelDataTypeImages,
} from "components-care";

interface BackendImageReadType {
  small: string | null;
  medium: string | null;
  large: string | null;
}

const deserialize = (value: BackendImageReadType) =>
  value == null || typeof value === "string" ? value : value.large;

// @ts-expect-error unsupported
ModelDataTypeImages.prototype.deserialize = deserialize;
// @ts-expect-error unsupported
ModelDataTypeImageRenderer.prototype.deserialize = deserialize;
