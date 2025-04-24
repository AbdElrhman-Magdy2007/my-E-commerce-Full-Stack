import { Languages } from "./constants/enums";


export type LanguageType = Languages.ARABIC | Languages.ENGLISH;

type i18nType = {
    locales: LanguageType[];
    defaultLocale: LanguageType;
};

export const i18n: i18nType = {
    locales: [Languages.ENGLISH, Languages.ARABIC],
    defaultLocale: Languages.ARABIC
}

export type Locale = (typeof i18n)["locales"][number];