/**
 * Date utilities for organizing medical records and prescriptions
 */

/**
 * Format date to readable string
 * @param {string|Date} date - ISO date string or Date object
 * @returns {string} Formatted date (e.g., "15 Mar 2026")
 */
export const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/**
 * Get month-year key from date
 * @param {string|Date} date - ISO date string or Date object
 * @returns {string} Month-year key (e.g., "2026-03")
 */
export const getMonthKey = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

/**
 * Get month-year label
 * @param {string} monthKey - Month key (e.g., "2026-03")
 * @returns {string} Formatted label (e.g., "March 2026")
 */
export const getMonthLabel = (monthKey) => {
  if (!monthKey) return "";
  const [year, month] = monthKey.split("-");
  const date = new Date(year, parseInt(month) - 1);
  return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
};

/**
 * Organize records by month
 * @param {Array} records - Array of records with createdAt or date field
 * @returns {Object} Organized records {monthKey: [records]}
 */
export const organizeByMonth = (records) => {
  if (!Array.isArray(records)) return {};

  const organized = {};
  records.forEach((record) => {
    const dateField = record.createdAt || record.date;
    const monthKey = getMonthKey(dateField);
    if (!organized[monthKey]) {
      organized[monthKey] = [];
    }
    organized[monthKey].push(record);
  });

  // Sort records within each month by date (newest first)
  Object.keys(organized).forEach((monthKey) => {
    organized[monthKey].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date);
      const dateB = new Date(b.createdAt || b.date);
      return dateB - dateA;
    });
  });

  return organized;
};

/**
 * Get sorted month keys (newest first)
 * @param {Object} organizedRecords - Organized records object
 * @returns {Array} Sorted month keys
 */
export const getSortedMonthKeys = (organizedRecords) => {
  if (!organizedRecords || typeof organizedRecords !== "object") return [];

  return Object.keys(organizedRecords).sort((a, b) => {
    const dateA = new Date(a + "-01");
    const dateB = new Date(b + "-01");
    return dateB - dateA;
  });
};

/**
 * Check if prescription is valid (not expired)
 * @param {Date|string} validUntil - Expiry date
 * @returns {boolean} True if prescription is still valid
 */
export const isPrescriptionValid = (validUntil) => {
  if (!validUntil) return true; // No expiry date means it's valid
  const expiryDate = new Date(validUntil);
  return expiryDate > new Date();
};

/**
 * Get days remaining for prescription validity
 * @param {Date|string} validUntil - Expiry date
 * @returns {number} Days remaining (negative if expired)
 */
export const getDaysRemaining = (validUntil) => {
  if (!validUntil) return null;
  const expiryDate = new Date(validUntil);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiryDate.setHours(0, 0, 0, 0);
  const diffTime = expiryDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Get validity status text and color
 * @param {Date|string} validUntil - Expiry date
 * @returns {Object} {status: string, color: string}
 */
export const getValidityStatus = (validUntil) => {
  if (!validUntil) {
    return { status: "No expiry", color: "text-slate-500" };
  }

  const daysRemaining = getDaysRemaining(validUntil);

  if (daysRemaining < 0) {
    return { status: "Expired", color: "text-red-600" };
  }

  if (daysRemaining === 0) {
    return { status: "Expires today", color: "text-orange-600" };
  }

  if (daysRemaining <= 7) {
    return { status: `Expires in ${daysRemaining} days`, color: "text-orange-500" };
  }

  return { status: `Expires in ${daysRemaining} days`, color: "text-green-600" };
};
