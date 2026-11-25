import { useCCLanguagesTranslations } from "components-care";
import { useCurrentLanguage } from "components-care/dist/utils/useCurrentLocale";

/**
 * The name of the language the UI is shown in, in that language (e.g.
 * "Deutsch"), as the language dialog names it. Follows a language change.
 */
const useCurrentLanguageName = (): string => {
  const language = useCurrentLanguage();
  const { t } = useCCLanguagesTranslations();
  return t(language);
};

export default useCurrentLanguageName;
