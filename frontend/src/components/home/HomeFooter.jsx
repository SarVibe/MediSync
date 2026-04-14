import { memo } from "react";
import { CircleCheck } from "lucide-react";

const footerLinks = {
  Platform: ["#features", "#how-it-works", "#system-states", "#testimonials"],
  Access: ["/login", "/register", "/appointments", "/dashboard"],
  Company: ["/about", "/contact"],
  Legal: ["/privacy-policy", "/terms-of-service"],
};

const footerLabelMap = {
  "#features": "Features",
  "#how-it-works": "How it Works",
  "#system-states": "System States",
  "#testimonials": "Testimonials",
  "/login": "Login",
  "/register": "Register",
  "/appointments": "Appointments",
  "/dashboard": "Dashboard",
  "/about": "About Us",
  "/contact": "Contact Us",
  "/privacy-policy": "Privacy Policy",
  "/terms-of-service": "Terms of Service",
};

const HomeFooter = memo(function HomeFooter() {
  return (
    <footer className="text-white border-t border-slate-200 bg-slate-950">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_0.6fr_0.6fr_0.6fr_0.6fr] lg:px-8">
        <div>
          <div className="flex gap-3 items-center">
            <div className="flex overflow-hidden justify-center items-center w-11 h-11 rounded-2xl shadow-lg transition duration-300 group-hover:scale-105 group-hover:shadow-xl">
              <img
                src="/MediSync_Logo_3.png"
                alt="MediSync logo"
                className="object-cover w-full h-full"
              />
            </div>
            <span className="text-xl font-extrabold">
              <span className="text-blue-400">Medi</span>
              <span className="text-emerald-400">Sync</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-7 text-slate-400">
            A modern healthcare platform for patients, doctors, and administrators
            - built with trust, structure, and usability in mind.
          </p>
          <div className="flex gap-2 items-center mt-5 text-xs text-slate-500">
            <CircleCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>HIPAA-aware design patterns</span>
          </div>
        </div>

        {Object.entries(footerLinks).map(([group, links]) => (
          <div key={group}>
            <h3 className="text-xs font-bold tracking-widest uppercase text-slate-400">
              {group}
            </h3>
            <ul className="flex flex-col gap-3 mt-4">
              {links.map((href) => (
                <li key={href}>
                  <a
                    href={href}
                    className="text-sm rounded transition-colors duration-200 text-slate-500 hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  >
                    {footerLabelMap[href]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="px-4 py-5 text-center border-t border-slate-800 sm:px-6 lg:px-8">
        <p className="text-xs text-slate-600">
          © {new Date().getFullYear()} MediSync. Built for modern healthcare.
        </p>
      </div>
    </footer>
  );
});

export default HomeFooter;
