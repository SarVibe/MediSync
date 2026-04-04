const BrandLogo = ({ size = "md", showText = true, className = "" }) => {
  const iconSize =
    size === "lg" ? "w-10 h-10" : size === "sm" ? "w-6 h-6" : "w-8 h-8";
  const plusSize =
    size === "lg" ? "w-5 h-5" : size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const textSize =
    size === "lg" ? "text-xl" : size === "sm" ? "text-base" : "text-lg";

  return (
    <div className={`flex items-center gap-2.5 ${className}`.trim()}>
      <div
        className={`
          ${iconSize} rounded-xl flex items-center justify-center
          border border-blue-500/60 bg-blue-500/5
          shadow-[0_0_12px_rgba(37,99,235,0.15)]
        `}
      >
        <svg
          className={`${plusSize} text-green-500`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
      </div>

      {showText && (
        <span className={`${textSize} font-bold tracking-tight`}>
          <span className="text-[#2563EB]">Medi</span>
          <span className="text-[#16A34A]">Sync</span>
        </span>
      )}
    </div>
  );
};

export default BrandLogo;
