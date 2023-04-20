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

// @ts-ignore
ModelDataTypeImages.prototype.deserialize = deserialize;
// @ts-ignore
ModelDataTypeImageRenderer.prototype.deserialize = deserialize;
