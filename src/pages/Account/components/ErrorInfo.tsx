import React from "react";
import { InfoBox } from "components-care";
import { useTranslation } from "react-i18next";

export interface ErrorInfoProps {
  message: string;
}

/** error message in an expanded red InfoBox */
const ErrorInfo = (props: ErrorInfoProps) => {
  const { t } = useTranslation("account");
  return (
    <InfoBox
      status={"error"}
      heading={t("common.error")}
      message={props.message}
      expanded
    />
  );
};

export default React.memo(ErrorInfo);
