import { memo } from "react";
import RevealOnScroll from "../common/RevealOnScroll";
import { SectionEyebrow } from "./SectionTitle";

const CTASection = memo(function CTASection() {
  return (
    <section className="px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
      <RevealOnScroll>
        <div
          className="overflow-hidden p-8 mx-auto max-w-7xl text-white rounded-3xl sm:p-10 lg:p-14"
          style={{
            background: "linear-gradient(135deg, #1e40af 0%, #2563eb 40%, #059669 100%)",
          }}
        >
          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr] lg:items-center">
            <div>
              <SectionEyebrow>
                <span className="text-blue-200">Ready to launch?</span>
              </SectionEyebrow>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Give MediSync a home page that earns trust immediately.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-blue-100 sm:text-base">
                Clean structure, confident branding, real system states, and a strong
                first impression. That is what patients and doctors expect from day
                one.
              </p>
            </div>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
});

export default CTASection;
