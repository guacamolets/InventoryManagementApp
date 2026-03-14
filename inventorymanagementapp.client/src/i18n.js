import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./i18n/en.json";
import ru from "./i18n/ru.json";

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            ru: { translation: ru },
            en: { translation: en }
        },
        fallbackLng: "en",
        detection: {
            order: ["localStorage", "cookie", "htmlTag", "path", "subdomain"],
            caches: ["localStorage"]
        },
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;