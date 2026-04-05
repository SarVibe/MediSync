// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563EB",
          light: "#DBEAFE",
          dark: "#1E40AF",
        },
        success: {
          DEFAULT: "#16A34A",
          light: "#DCFCE7",
          dark: "#166534",
        },
        danger: {
          DEFAULT: "#DC2626",
          light: "#FEE2E2",
          dark: "#991B1B",
        },
        neutral: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          150: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          700: "#374151",
          900: "#111827",
        },
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "0.5rem",
      },
    },
  },
  plugins: [],
};
