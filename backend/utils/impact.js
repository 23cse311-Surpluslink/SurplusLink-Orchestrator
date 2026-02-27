/**
 * @module Impact Calculations
 * @description Standardized formulas for converting food quantities into measurable impact metrics.
 * Supports User Story 7.1 (Meals Saved) and 7.2 (CO2 Savings).
 */

/**
 * Parses quantity strings and returns weight in kilograms.
 * Standardizes diverse input formats like "10 kg", "500 g", "5 units".
 * @param {string} quantityStr 
 * @returns {number} Weight in KG
 */
export const convertToWeight = (quantityStr) => {
    if (!quantityStr) return 0;

    const str = String(quantityStr).toLowerCase();
    const match = str.match(/(\d+(\.\d+)?)/);
    if (!match) return 1; // Default fallback if no number found

    const value = parseFloat(match[0]);

    if (str.includes('kg') || str.includes('kilogram')) return value;
    if (str.includes('g') || str.includes('gram')) return value / 1000;
    if (str.includes('lb') || str.includes('pound')) return value * 0.453592;
    if (str.includes('litre') || str.includes('l')) return value; // 1L ~ 1kg approx for water-based food

    // For units/packets/servings, assuming 250g per unit if not specified
    if (str.includes('unit') || str.includes('packet') || str.includes('box')) return value * 0.25;

    // Default: assume the number is already in KG if no unit specified
    return value;
};

/**
 * Converts weight in KG to number of meals.
 * Formula: 1 Meal = 0.5 KG (Standard FAO/UN definition for food rescue)
 * @param {number} weightKg 
 * @returns {number}
 */
export const calculateMeals = (weightKg) => {
    return parseFloat((weightKg / 0.5).toFixed(1));
};

/**
 * Calculates CO2 emissions prevented by rescuing food.
 * Formula: 1 KG food waste prevented = 2.5 KG CO2e saved.
 * @param {number} weightKg 
 * @returns {number}
 */
export const calculateCo2Savings = (weightKg) => {
    return parseFloat((weightKg * 2.5).toFixed(2));
};
