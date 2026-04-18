/**
 * Utility functions for user profiles (Patients and Doctors).
 */

const PROFILE_IMAGE_BASE_URL = (
  import.meta.env.VITE_PROFILE_IMAGE_BASE_URL || "http://localhost:8083"
).replace(/\/$/, "");

/**
 * Resolves a profile image URL, handling relative paths and absolute URLs.
 * It also intelligently corrects URLs pointing to the API Gateway port (9000)
 * to point to the dedicated Image Service port (8083).
 * 
 * @param {string} url - The raw URL or path from the backend
 * @returns {string} - The resolved absolute URL
 */
export const resolveProfileImageUrl = (url) => {
  if (!url) return "/unknown.jpg";

  const trimmedUrl = String(url).trim();
  
  // If it's a blob or data URL, return as is
  if (trimmedUrl.startsWith("blob:") || trimmedUrl.startsWith("data:")) {
    return trimmedUrl;
  }

  // If it's an absolute URL, check if it's pointing to our local backend ports
  if (/^https?:\/\//i.test(trimmedUrl)) {
    // If it's already pointing to the known image base, or an external site, return it
    if (trimmedUrl.startsWith(PROFILE_IMAGE_BASE_URL)) {
      return trimmedUrl;
    }

    // If it's pointing to the API Gateway (9000) or similar but the image service is on 8083,
    // we need to extract the path and re-prepend the correct image base.
    try {
      const parsed = new URL(trimmedUrl);
      // If it's localhost or an IP (common for local dev) and NOT the correct image port
      if ((parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") && 
          !PROFILE_IMAGE_BASE_URL.includes(parsed.port)) {
        return `${PROFILE_IMAGE_BASE_URL}${parsed.pathname}${parsed.search}`;
      }
    } catch (e) {
      // Fallback if URL parsing fails
    }

    return trimmedUrl;
  }

  // Handle backend relative paths
  return `${PROFILE_IMAGE_BASE_URL}${trimmedUrl.startsWith("/") ? "" : "/"}${trimmedUrl}`;
};

/**
 * Generates initials from a name for use as a fallback avatar.
 * 
 * @param {string} name - The user's full name
 * @returns {string} - Up to 2 characters of initials
 */
export const getInitials = (name) => {
  if (!name) return "U";

  return name
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
};
