import { uniqueArray, useModelGet } from "components-care";
import { useAppAdminModel } from "../components-care/models/AppAdminModel";
import { SupportedLanguages } from "../i18n";
import { useMemo } from "react";
import { MultiLanguageInputSupportedLanguages } from "components-care/dist/standalone/UIKit/InputControls/MultiLanguageInput";

const DEFAULT_LANGUAGES: MultiLanguageInputSupportedLanguages[] = [];
const useAppLanguages = (
  appId: string | null,
): MultiLanguageInputSupportedLanguages[] => {
  const appModel = useAppAdminModel();
  const { data } = useModelGet(appModel, appId, { enabled: !!appId });
  const appLocales = useMemo(() => {
    if (!data) return null;
    const enabledLocales = (data[0].config as { locales: string[] }).locales;
    return uniqueArray(
      enabledLocales.map(
        (locale) =>
          locale.split("-")[0] as MultiLanguageInputSupportedLanguages,
      ),
    );
  }, [data]);
  return appId ? (appLocales ?? DEFAULT_LANGUAGES) : SupportedLanguages;
};

export default useAppLanguages;
