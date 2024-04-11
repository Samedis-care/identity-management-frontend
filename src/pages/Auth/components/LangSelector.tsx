import React, { useState } from "react";
import {
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  PopoverOrigin,
  styled,
} from "@mui/material";
import { Translate } from "@mui/icons-material";
import supportedLanguages from "../../../assets/data/supported-languages.json";
import localeData from "components-care/dist/assets/data/locale-relevance.json";
import { ComponentsCareI18n, sortByLocaleRelevance } from "components-care";
import { useCCLanguagesTranslations } from "components-care/dist/utils/useCCTranslations";

export interface LangSelectorProps {
  className?: string;
}
const MenuWithBorder = styled(Menu)(({ theme }) => ({
  "& .MuiMenu-paper": {
    border: `1px solid ${theme.palette.divider}`,
  },
}));

const menuAnchorOrigin: PopoverOrigin = {
  vertical: "bottom",
  horizontal: "center",
};
const menuTransformOrigin: PopoverOrigin = {
  vertical: "top",
  horizontal: "center",
};

const langData = supportedLanguages
  .map((lang) => {
    const locales = Object.keys(localeData).filter((locale) =>
      locale.startsWith(lang + "-"),
    );
    locales.sort(sortByLocaleRelevance);
    return {
      lang: lang,
      locale: locales[0] ?? lang,
    };
  })
  .sort((a, b) => sortByLocaleRelevance(a.locale, b.locale));

const LangSelector = (props: LangSelectorProps) => {
  const { className } = props;
  const [langMenuAnchor, setLangMenuAnchor] = useState<Element | null>(null);
  const { t } = useCCLanguagesTranslations();

  const onChangeLanguage = React.useCallback(
    (evt: React.MouseEvent<HTMLLIElement>) => {
      const newLocale =
        evt.currentTarget.attributes.getNamedItem("data-value")!.value;
      void ComponentsCareI18n.changeLanguage(newLocale);
      setLangMenuAnchor(null);
    },
    [setLangMenuAnchor],
  );

  const handleFlagClick = React.useCallback(
    (evt: React.MouseEvent<HTMLElement>) => {
      setLangMenuAnchor(evt.currentTarget);
    },
    [setLangMenuAnchor],
  );
  const handleMenuClose = React.useCallback(() => {
    setLangMenuAnchor(null);
  }, [setLangMenuAnchor]);

  return (
    <>
      <IconButton onClick={handleFlagClick} className={className} size="large">
        <Translate />
      </IconButton>
      <MenuWithBorder
        elevation={0}
        anchorOrigin={menuAnchorOrigin}
        transformOrigin={menuTransformOrigin}
        anchorEl={langMenuAnchor}
        keepMounted
        open={!!langMenuAnchor}
        onClose={handleMenuClose}
      >
        {langData.map((data) => {
          return (
            <MenuItem
              key={data.lang}
              data-value={data.locale}
              onClick={onChangeLanguage}
            >
              <ListItemText primary={t(data.lang)} />
            </MenuItem>
          );
        })}
      </MenuWithBorder>
    </>
  );
};

export default React.memo(LangSelector);
