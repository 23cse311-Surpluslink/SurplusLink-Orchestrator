import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilityContextType {
    simplifiedMode: boolean;
    setSimplifiedMode: (enabled: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
    const [simplifiedMode, setSimplifiedMode] = useState(() => {
        return localStorage.getItem('simplified-mode') === 'true';
    });

    useEffect(() => {
        localStorage.setItem('simplified-mode', simplifiedMode ? 'true' : 'false');
        if (simplifiedMode) {
            document.documentElement.classList.add('simplified-mode');
        } else {
            document.documentElement.classList.remove('simplified-mode');
        }
    }, [simplifiedMode]);

    return (
        <AccessibilityContext.Provider value={{ simplifiedMode, setSimplifiedMode }}>
            {children}
        </AccessibilityContext.Provider>
    );
}

export function useAccessibility() {
    const context = useContext(AccessibilityContext);
    if (!context) {
        throw new Error('useAccessibility must be used within an AccessibilityProvider');
    }
    return context;
}
