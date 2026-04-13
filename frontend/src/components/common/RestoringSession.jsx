import { useEffect, useState } from "react";

const keyframes = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes pulse-ring {
    0%, 100% { transform: scale(1); opacity: 0.15; }
    50% { transform: scale(1.18); opacity: 0.35; }
  }
  @keyframes fade-up {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes dot-bounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.35; }
    40% { transform: translateY(-5px); opacity: 1; }
  }
  @keyframes bar-fill {
    from { width: 0%; }
    to { width: 68%; }
  }

  .rs-fade-up-1 { animation: fade-up 0.5s 0.0s ease both; }
  .rs-fade-up-2 { animation: fade-up 0.5s 0.12s ease both; }
  .rs-fade-up-3 { animation: fade-up 0.5s 0.24s ease both; }
  .rs-fade-up-4 { animation: fade-up 0.5s 0.36s ease both; }

  .rs-spinner { animation: spin 1.1s linear infinite; }
  .rs-spinner-sm { animation: spin 1.1s linear infinite; }
  .rs-pulse-ring { animation: pulse-ring 2.2s ease-in-out infinite; }

  .rs-dot { animation: dot-bounce 1.4s ease-in-out infinite; }
  .rs-dot:nth-child(2) { animation-delay: 0.16s; }
  .rs-dot:nth-child(3) { animation-delay: 0.32s; }

  .rs-progress-bar { animation: bar-fill 2.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.5s both; }

  .rs-step { transition: opacity 0.3s, transform 0.3s; }
  .rs-step:hover { opacity: 0.85; transform: translateX(3px); }
`;

const CheckIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M2.5 6l2.5 2.5 4.5-5"
      stroke="#16a34a"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SpinnerSmIcon = () => (
  <svg
    className="rs-spinner-sm"
    width="11"
    height="11"
    viewBox="0 0 11 11"
    fill="none"
    stroke="#9ca3af"
    strokeWidth="1.5"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <circle cx="5.5" cy="5.5" r="4" opacity="0.25" />
    <path d="M5.5 1.5a4 4 0 0 1 4 4" />
  </svg>
);

const PendingIcon = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 11 11"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="5.5" cy="5.5" r="4" stroke="#d1d5db" strokeWidth="1.25" />
  </svg>
);

const MainSpinnerIcon = () => (
  <svg
    className="rs-spinner"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="1.75"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path
      d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
      stroke="#9ca3af"
      opacity="0.35"
    />
    <path d="M12 2v4" stroke="#111827" />
    <path d="M16.24 7.76l2.83-2.83" stroke="#111827" opacity="0.75" />
    <path d="M18 12h4" stroke="#111827" opacity="0.55" />
  </svg>
);

const STEPS = [
  {
    id: "auth",
    label: "Authentication verified",
    state: "done",
  },
  {
    id: "prefs",
    label: "Preferences loaded",
    state: "done",
  },
  {
    id: "sync",
    label: "Syncing workspace data",
    state: "active",
    progress: 68,
  },
  {
    id: "env",
    label: "Finalizing environment",
    state: "pending",
  },
];

function StepIcon({ state }) {
  if (state === "done") {
    return (
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: "#dcfce7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <CheckIcon />
      </div>
    );
  }
  if (state === "active") {
    return (
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <SpinnerSmIcon />
      </div>
    );
  }
  return (
    <div
      style={{
        width: 24,
        height: 24,
        borderRadius: "50%",
        background: "#f9fafb",
        border: "1px solid #f3f4f6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <PendingIcon />
    </div>
  );
}

function Step({ step }) {
  const isPending = step.state === "pending";
  return (
    <div
      className="rs-step"
      style={{ display: "flex", flexDirection: "column", gap: 8 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <StepIcon state={step.state} />
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <p
            style={{
              fontSize: 13,
              fontWeight: 500,
              margin: 0,
              color: isPending ? "#9ca3af" : "#111827",
              opacity: isPending ? 0.5 : 1,
            }}
          >
            {step.label}
          </p>
          {step.state === "active" && step.progress !== undefined && (
            <span
              style={{ fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap" }}
            >
              {step.progress}%
            </span>
          )}
        </div>
      </div>

      {step.state === "active" && step.progress !== undefined && (
        <div style={{ paddingLeft: 36 }}>
          <div
            style={{
              background: "#f3f4f6",
              borderRadius: 99,
              height: 4,
              overflow: "hidden",
              width: "100%",
            }}
          >
            <div
              className="rs-progress-bar"
              style={{
                height: "100%",
                borderRadius: 99,
                background: "#111827",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function RestoringSession() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <style>{keyframes}</style>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f9fafb",
          padding: "2rem 1rem",
          fontFamily:
            "'DM Sans', 'Geist', system-ui, -apple-system, sans-serif",
        }}
        role="status"
        aria-label="Restoring Session"
        aria-live="polite"
      >
        <div
          style={{
            width: "100%",
            maxWidth: 400,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Spinner icon */}
          <div
            className="rs-fade-up-1"
            style={{
              position: "relative",
              width: 72,
              height: 72,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "2rem",
            }}
          >
            <div
              className="rs-pulse-ring"
              style={{
                position: "absolute",
                inset: -10,
                borderRadius: "50%",
                border: "1.5px solid #d1d5db",
              }}
            />
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "#f3f4f6",
                border: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MainSpinnerIcon />
            </div>
          </div>

          {/* Heading */}
          <div
            className="rs-fade-up-2"
            style={{ textAlign: "center", marginBottom: "0.5rem" }}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: 500,
                margin: "0 0 6px",
                color: "#111827",
                letterSpacing: "-0.01em",
              }}
            >
              Restoring Your Session
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "#6b7280",
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              Picking up right where you left off
            </p>
          </div>

          {/* Bouncing dots */}
          <div
            className="rs-fade-up-3"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              margin: "1.25rem 0 1.75rem",
            }}
            aria-hidden="true"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="rs-dot"
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#9ca3af",
                  display: "block",
                  animationDelay: `${i * 0.16}s`,
                }}
              />
            ))}
          </div>

          {/* Steps card */}
          <div
            className="rs-fade-up-4"
            style={{
              width: "100%",
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: "1rem 1.25rem",
              marginBottom: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {STEPS.map((step) => (
              <Step key={step.id} step={step} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
