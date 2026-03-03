/**
 * @module i18n
 * @description Server-side localization support for notifications and system messages.
 * Supports User Story 7.5.
 */

const translations = {
    en: {
        'donation_created': 'New donation available: {title}',
        'donation_cancelled': 'Donation cancelled: {title}',
        'donation_completed': 'Donation "{title}" was completed! Impact: {meals} meals saved.',
        'donation_assigned': 'Your donation "{title}" has been claimed by {organization}!',
        'volunteer_accepted': 'Volunteer {name} is on their way to pick up your donation "{title}"!',
        'donation_picked_up': 'Your donation "{title}" has been picked up by {name}!',
        'donation_delivered': 'Your donation "{title}" has been delivered to the NGO!',
        'donation_rejected': 'Your donation "{title}" was rejected: {reason}',
        'mission_reassigned': 'The mission for "{title}" is being reassigned to ensure prompt delivery.',
        'mission_verified': 'Mission Verified! Delivery for "{title}" confirmed. +{meals} meals impact!',
        'promoted': 'Congratulations! You\'ve been promoted to {tier} tier!',
        'welcome': 'Welcome to SurplusLink!',
        'admin_intervention': 'Admin Intervention: The task for "{title}" has been {action}ed. Reason: {reason}',
        'account_verify': 'Your account has been {status} by the administration.',
        'donation_expired': 'Your donation "{title}" has expired and is no longer available.',
        'priority_dispatch': 'MISSION ALERT: "{title}" ({foodType}) for {quantity} is available nearby. You have priority! Expiring soon.',
    },
    hi: {
        'donation_created': 'नया दान उपलब्ध है: {title}',
        'donation_cancelled': 'दान रद्द कर दिया गया: {title}',
        'donation_completed': 'दान "{title}" पूरा हो गया! प्रभाव: {meals} भोजन बचाए गए।',
        'mission_verified': 'मिशन सत्यापित! "{title}" के लिए वितरण की पुष्टि की गई। +{meals} भोजन का प्रभाव!',
        'promoted': 'बधाई हो! आपको {tier} स्तर पर पदोन्नत किया गया है!',
        'welcome': 'सरप्लसलिंक में आपका स्वागत है!',
        'admin_intervention': 'व्यवस्थापक हस्तक्षेप: "{title}" के लिए कार्य {action} कर दिया गया है। कारण: {reason}',
        'account_verify': 'आपके खाते को प्रशासन द्वारा {status} कर दिया गया है।',
    },
    kn: {
        'donation_created': 'ಹೊಸ ದೇಣಿಗೆ ಲಭ್ಯವಿದೆ: {title}',
        'donation_cancelled': 'ದೇಣಿಗೆ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ: {title}',
        'donation_completed': 'ದೇಣಿಗೆ "{title}" ಪೂರ್ಣಗೊಂಡಿದೆ! ಪರಿಣಾಮ: {meals} ಊಟಗಳನ್ನು ಉಳಿಸಲಾಗಿದೆ.',
        'mission_verified': 'ಮಿಷನ್ ಪರಿಶೀಲಿಸಲಾಗಿದೆ! "{title}" ಗಾಗಿ ವಿತರಣೆಯನ್ನು ದೃಢೀಕರಿಸಲಾಗಿದೆ. +{meals} ಊಟದ ಪರಿಣಾಮ!',
        'promoted': 'ಅಭಿನಂದನೆಗಳು! ನಿಮ್ಮನ್ನು {tier} ಶ್ರೇಣಿಗೆ ಬಡ್ತಿ ನೀಡಲಾಗಿದೆ!',
        'welcome': 'ಸರ್ಪ್ಲಸ್‌ಲಿಂಕ್‌ಗೆ ಸುಸ್ವಾಗತ!',
    },
    te: {
        'donation_created': 'కొత్త విరాళం అందుబాటులో ఉంది: {title}',
        'donation_cancelled': 'విరాళం రద్దు చేయబడింది: {title}',
        'donation_completed': 'విరాళం "{title}" పూర్తయింది! ప్రభావం: {meals} భోజనాలు ఆదా అయ్యాయి.',
        'mission_verified': 'మిషన్ ధృవీకరించబడింది! "{title}" కోసం డెలివరీ ధృవీకరించబడింది. +{meals} భోజనాల ప్రభావం!',
        'promoted': 'అభినందనలు! మీరు {tier} స్థాయికి పదోన్నతి పొందారు!',
        'welcome': 'సర్ప్లస్ లింక్ కు స్వాగతం!',
    },
    ta: {
        'donation_created': 'புதிய நன்கொடை உள்ளது: {title}',
        'donation_cancelled': 'நன்கொடை ரத்து செய்யப்பட்டது: {title}',
        'donation_completed': 'நன்கொடை "{title}" முடிந்தது! தாக்கம்: {meals} உணவுகள் சேமிக்கப்பட்டன.',
        'mission_verified': 'பணி சரிபார்க்கப்பட்டது! "{title}" விநியோகம் உறுதிப்படுத்தப்பட்டது. +{meals} உணவுகள் தாக்கம்!',
        'promoted': 'வாழ்த்துகள்! நீங்கள் {tier} நிலைக்கு உயர்த்தப்பட்டுள்ளீர்கள்!',
        'welcome': 'சர்ப்ளஸ்லிங்கிற்கு வரவேற்கிறோம்!',
    }
};

/**
 * Translates a key based on language and replaces placeholders.
 * @param {string} lang - Language code ('en', 'hi', etc.)
 * @param {string} key - Translation key
 * @param {Object} params - Dynamic parameters for replacement
 * @returns {string} Translated string
 */
export const t = (lang = 'en', key, params = {}) => {
    const langDict = translations[lang] || translations.en;
    let message = langDict[key] || translations.en[key] || key;

    // Replace placeholders {key} with params[key]
    Object.keys(params).forEach(param => {
        message = message.replace(`{${param}}`, params[param]);
    });

    return message;
};

export default translations;
