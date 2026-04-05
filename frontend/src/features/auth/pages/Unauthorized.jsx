import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Unauthorized() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { ctaLabel, ctaTo } = useMemo(() => {
    const role = String(user?.role || "").toUpperCase();
    const approvalStatus = String(user?.approval_status || "").toUpperCase();

    if (role === "PATIENT") {
      if (approvalStatus === "PENDING") return { ctaLabel: "View Pending Request", ctaTo: "/request-pending" };
      if (approvalStatus === "REJECTED") return { ctaLabel: "Re-apply for Doctor Upgrade", ctaTo: "/upgrade-request" };
      return { ctaLabel: "Go to Appointments", ctaTo: "/patient/appointments" };
    }

    if (role === "DOCTOR") {
      return { ctaLabel: "View Your Profile", ctaTo: "/profile" };
    }

    return { ctaLabel: "Go to Login", ctaTo: "/auth/login" };
  }, [user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="max-w-xl w-full text-center space-y-4">
        <h1 className="text-3xl font-bold text-neutral-900">Unauthorized</h1>
        <p className="text-sm text-neutral-600">
          Your account is not permitted to access this area yet. This usually happens when your profile
          is incomplete or your doctor upgrade request is still pending/rejected.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
          <button
            type="button"
            onClick={() => navigate(ctaTo)}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
            style={{ background: "var(--color-primary)" }}
          >
            {ctaLabel}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

