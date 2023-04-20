import React from "react";
import {
  ImageSelector,
  Loader,
  ModelDataTypeImageRenderer,
  useModelGet,
  useModelMutation,
} from "components-care";
import { useProfileModel } from "../../../components-care/models/ProfileModel";

/**
 * Special case: Profile picture should be persisted immediately
 */
const ProfilePicture = () => {
  const model = useProfileModel();
  const name = "image"; // model field name
  const id = "singleton"; // ID used in form
  const field = model.fields[name];
  const fieldType = field.type as ModelDataTypeImageRenderer;
  const { data, isLoading, error, refetch } = useModelGet(model, id);
  const { mutateAsync: updateProfile } = useModelMutation(model);

  if (isLoading) return <Loader />;
  if (error) return <span>{(error as Error).message}</span>;
  if (!data) throw new Error("!isLoading && !error but no data");

  return (
    <ImageSelector
      name={name}
      value={data[0][name] as string}
      label={field.getLabel()}
      readOnly={false}
      onChange={async (name, value) => {
        await updateProfile({ id, image: value });
        await refetch();
      }}
      alt={field.getLabel()}
      capture={fieldType.getParams().capture ?? false}
      uploadLabel={fieldType.getParams().uploadLabel}
      convertImagesTo={fieldType.getParams().convertImagesTo}
      downscale={fieldType.getParams().downscale}
      variant={fieldType.getParams().variant}
    />
  );
};

export default React.memo(ProfilePicture);
