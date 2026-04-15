import { memo } from "react";
import { Star } from "lucide-react";
import RevealOnScroll from "../common/RevealOnScroll";
import SectionTitle from "./SectionTitle";

const testimonials = [
  {
    quote:
      "The interface feels clean and easy to use. Booking and managing appointments is far less confusing now.",
    name: "Nethmi Perera",
    role: "Patient",
    stars: 5,
  },
  {
    quote:
      "The doctor approval flow and profile handling are much clearer. It feels like a real product, not a prototype.",
    name: "Dr. A. Fernando",
    role: "Medical Practitioner",
    stars: 5,
  },
  {
    quote:
      "Admin management is more structured. The platform gives a trustworthy first impression from the home page.",
    name: "Operations Team",
    role: "Healthcare Admin",
    stars: 5,
  },
];

const TestimonialCard = memo(function TestimonialCard({
  quote,
  name,
  role,
  stars,
  delay,
}) {
  return (
    <RevealOnScroll delay={delay}>
      <article className="p-6 h-full bg-white rounded-2xl border shadow-sm transition-all duration-300 cursor-default group border-slate-200 hover:-translate-y-1 hover:shadow-lg">
        <div className="flex gap-1" aria-label={`${stars} stars`}>
          {Array.from({ length: stars }).map((_, index) => (
            <Star key={index} className="w-4 h-4 text-amber-400 fill-amber-400" />
          ))}
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-600">"{quote}"</p>
        <div className="flex gap-3 items-center mt-5">
          <div className="flex justify-center items-center w-9 h-9 text-xs font-bold text-white from-blue-500 to-emerald-500 rounded-full bg-linear-to-br">
            {name
              .split(" ")
              .map((word) => word[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{name}</p>
            <p className="text-xs text-slate-500">{role}</p>
          </div>
        </div>
      </article>
    </RevealOnScroll>
  );
});

const TestimonialsSection = memo(function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-16 bg-slate-50 sm:py-20 lg:py-24">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <RevealOnScroll>
          <SectionTitle
            eyebrow="User Confidence"
            title="Trusted by patients, doctors, and admins"
            description="People judge your system fast. A clean, credible interface speaks before any feature does."
            centered
          />
        </RevealOnScroll>

        <div className="grid gap-5 mt-12 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.name}
              {...testimonial}
              delay={index * 80}
            />
          ))}
        </div>
      </div>
    </section>
  );
});

export default TestimonialsSection;
