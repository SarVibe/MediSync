import { memo, useMemo, useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock3,
  Send,
  Users,
  FileText,
  Info,
  Loader2,
  AlertCircle,
  RefreshCw,
  Inbox,
} from "lucide-react";
import { notifyError, notifySuccess } from "../../utils/toast";
import PageShell, {
  SectionCard,
  InfoList,
  FormField,
  InlineAlert,
  RevealOnScroll,
} from "./SupportPageLayout";

// ─────────────────────────────────────────────────────────────────────────────
// Small reusable UI
// ─────────────────────────────────────────────────────────────────────────────

const ContactPageSkeleton = memo(function ContactPageSkeleton() {
  return (
    <div className="px-4 py-6 mx-auto w-full max-w-7xl animate-pulse sm:px-6 lg:px-8 lg:py-10">
      <div className="space-y-6">
        <div className="p-6 bg-white rounded-3xl border shadow-sm border-slate-200">
          <div className="w-24 h-4 rounded bg-slate-200" />
          <div className="mt-4 w-72 max-w-full h-8 rounded bg-slate-200" />
          <div className="mt-3 max-w-full h-4 rounded w-lg bg-slate-100" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="p-6 bg-white rounded-3xl border shadow-sm border-slate-200 lg:col-span-2">
            <div className="space-y-5">
              <div className="w-40 h-6 rounded bg-slate-200" />
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="w-24 h-4 rounded bg-slate-200" />
                  <div className="h-12 rounded-2xl bg-slate-100" />
                </div>
                <div className="space-y-2">
                  <div className="w-28 h-4 rounded bg-slate-200" />
                  <div className="h-12 rounded-2xl bg-slate-100" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-20 h-4 rounded bg-slate-200" />
                <div className="h-12 rounded-2xl bg-slate-100" />
              </div>
              <div className="space-y-2">
                <div className="w-24 h-4 rounded bg-slate-200" />
                <div className="h-36 rounded-2xl bg-slate-100" />
              </div>
              <div className="flex justify-end">
                <div className="w-36 h-12 rounded-2xl bg-slate-200" />
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border shadow-sm border-slate-200">
            <div className="space-y-4">
              <div className="w-36 h-6 rounded bg-slate-200" />
              <div className="h-20 rounded-2xl bg-slate-100" />
              <div className="h-20 rounded-2xl bg-slate-100" />
              <div className="h-20 rounded-2xl bg-slate-100" />
              <div className="h-20 rounded-2xl bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const EmptyState = memo(function EmptyState({
  title = "No contact details available",
  description = "There is no contact content to display right now.",
}) {
  return (
    <div className="px-6 py-12 text-center rounded-3xl border border-dashed shadow-sm border-slate-300 bg-slate-50/80">
      <div className="flex justify-center items-center mx-auto w-14 h-14 bg-white rounded-2xl shadow-sm text-slate-500">
        <Inbox className="w-6 h-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
});

const ErrorState = memo(function ErrorState({
  title = "Failed to load contact page",
  description = "Something went wrong while loading this content. Try again.",
  onRetry,
}) {
  return (
    <div className="px-6 py-12 text-center rounded-3xl border border-red-200 shadow-sm bg-red-50/80">
      <div className="flex justify-center items-center mx-auto w-14 h-14 text-red-500 bg-white rounded-2xl shadow-sm">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
        {description}
      </p>

      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      ) : null}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

export default function ContactUsPage({
  isPageLoading = false,
  hasPageError = false,
  isPageEmpty = false,
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inlineMessage, setInlineMessage] = useState("");

  const contactItems = useMemo(
    () => [
      {
        icon: Mail,
        label: "Email",
        value: "support@medisync.com",
      },
      {
        icon: Phone,
        label: "Phone",
        value: "+94 77 123 4567",
      },
      {
        icon: MapPin,
        label: "Address",
        value: "No. 25, Health Avenue, Colombo, Sri Lanka",
      },
      {
        icon: Clock3,
        label: "Support Hours",
        value: "Monday - Friday, 8:30 AM - 5:30 PM",
      },
    ],
    []
  );

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setInlineMessage("");
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
    setErrors({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
    setInlineMessage("");
  };

  const validate = () => {
    const trimmed = {
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    };

    const nextErrors = {
      name: !trimmed.name ? "Name is required." : "",
      email: !trimmed.email
        ? "Email is required."
        : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed.email)
          ? "Enter a valid email address."
          : "",
      subject: !trimmed.subject ? "Subject is required." : "",
      message: !trimmed.message
        ? "Message is required."
        : trimmed.message.length < 10
          ? "Message must be at least 10 characters."
          : "",
    };

    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      notifyError("Please correct the highlighted fields.");
      setInlineMessage("Please correct the highlighted fields and try again.");
      return;
    }

    try {
      setIsSubmitting(true);
      setInlineMessage("");

      await new Promise((resolve) => setTimeout(resolve, 1000));

      notifySuccess("Your message has been sent successfully.");
      setInlineMessage("Your message has been sent successfully.");
      resetForm();
    } catch {
      notifyError("Failed to send your message.");
      setInlineMessage("Failed to send your message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPageLoading) {
    return <ContactPageSkeleton />;
  }

  return (
    <PageShell
      eyebrow="Support"
      title="Contact Us"
      description="Have a question, issue, or partnership inquiry? Reach out through the form below or use our direct contact details."
      icon={Phone}
    >
      {hasPageError ? (
        <RevealOnScroll>
          <ErrorState onRetry={() => window.location.reload()} />
        </RevealOnScroll>
      ) : isPageEmpty ? (
        <RevealOnScroll>
          <EmptyState />
        </RevealOnScroll>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <RevealOnScroll delay={80} className="space-y-6 lg:col-span-2">
            <SectionCard
              title="Send a Message"
              description="Use the contact form for support, feedback, or general inquiries."
              icon={Send}
            >
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <FormField
                    id="contact-name"
                    label="Full Name"
                    icon={Users}
                    error={errors.name}
                  >
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                      placeholder="Enter your full name"
                      aria-invalid={Boolean(errors.name)}
                      className="pr-4 pl-11 w-full h-12 text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                  </FormField>

                  <FormField
                    id="contact-email"
                    label="Email Address"
                    icon={Mail}
                    error={errors.email}
                  >
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                      placeholder="Enter your email"
                      aria-invalid={Boolean(errors.email)}
                      className="pr-4 pl-11 w-full h-12 text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                  </FormField>
                </div>

                <FormField
                  id="contact-subject"
                  label="Subject"
                  icon={FileText}
                  error={errors.subject}
                >
                  <input
                    id="contact-subject"
                    name="subject"
                    type="text"
                    value={form.subject}
                    onChange={(e) => setField("subject", e.target.value)}
                    placeholder="What is this about?"
                    aria-invalid={Boolean(errors.subject)}
                    className="pr-4 pl-11 w-full h-12 text-sm bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                </FormField>

                <FormField
                  id="contact-message"
                  label="Message"
                  icon={Info}
                  error={errors.message}
                >
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={6}
                    value={form.message}
                    onChange={(e) => setField("message", e.target.value)}
                    placeholder="Write your message here"
                    aria-invalid={Boolean(errors.message)}
                    className="pt-3 pr-4 pl-11 w-full text-sm leading-6 bg-transparent resize-none text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                </FormField>

                <InlineAlert
                  type={
                    inlineMessage
                      ? inlineMessage.includes("successfully")
                        ? "success"
                        : inlineMessage.includes("Failed")
                          ? "error"
                          : "info"
                      : "info"
                  }
                  message={inlineMessage}
                />

                <div className="flex flex-col gap-3 pt-4 border-t border-slate-100 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs leading-5 text-slate-500">
                    This page uses your globally defined toaster for feedback.
                  </p>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={isSubmitting}
                      className="inline-flex justify-center items-center px-5 h-12 text-sm font-semibold bg-white rounded-2xl border transition-all duration-200 cursor-pointer border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Reset
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Message
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </SectionCard>
          </RevealOnScroll>

          <RevealOnScroll delay={160} className="space-y-6">
            <SectionCard
              title="Contact Information"
              description="Reach us directly through these channels."
              icon={Mail}
            >
              <InfoList items={contactItems} />
            </SectionCard>

            <SectionCard
              title="Before You Contact Us"
              description="Use the right channel so your issue does not waste time."
              icon={Info}
            >
              <div className="space-y-3">
                {[
                  "Use the contact form for support, general questions, and partnership inquiries.",
                  "Provide a real email address if you expect a reply.",
                  "Write the actual issue clearly instead of sending vague one-line messages.",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex gap-3 items-start px-4 py-3 rounded-2xl border transition-all duration-200 border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-white"
                  >
                    <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                    <p className="text-sm leading-6 text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </RevealOnScroll>
        </div>
      )}
    </PageShell>
  );
}
