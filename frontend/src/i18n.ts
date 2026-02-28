import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            "nav": {
                "dashboard": "Dashboard",
                "donations": "Donations",
                "impact": "Impact",
                "settings": "Settings",
                "admin": "Admin"
            },
            "impact": {
                "meals_saved": "Meals Saved",
                "co2_avoided": "CO₂ Avoided",
                "mass_recovered": "Mass Recovered",
                "rescue_success": "Rescue Success"
            },
            "common": {
                "save": "Save",
                "cancel": "Cancel",
                "loading": "Loading..."
            }
        }
    },
    hi: {
        translation: {
            "nav": {
                "dashboard": "डैशबोर्ड",
                "donations": "दान",
                "impact": "प्रभाव",
                "settings": "सेटिंग्स",
                "admin": "प्रशासक"
            },
            "impact": {
                "meals_saved": "बचाया गया भोजन",
                "co2_avoided": "कार्बन उत्सर्जन में कमी",
                "mass_recovered": "बरामद वजन",
                "rescue_success": "बचाव की सफलता"
            },
            "common": {
                "save": "सहेजें",
                "cancel": "रद्द करें",
                "loading": "लोड हो रहा है..."
            }
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
