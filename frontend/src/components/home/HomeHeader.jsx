import { memo, useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";

const navItems = ["Features", "How it Works", "System States", "Testimonials"];

const NavLink = memo(function NavLink({ href, children }) {
  return (
    <a
      href={href}
      className="relative px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 text-slate-600 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 group"
    >
      {children}
      <span className="absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-blue-500 transition-all duration-300 group-hover:w-full" />
    </a>
  );
});

const HomeHeader = memo(function HomeHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: scrolled
          ? "1px solid rgba(148,163,184,0.25)"
          : "1px solid transparent",
        boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.06)" : "none",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <a
          href="#home"
          className="flex gap-3 items-center rounded-xl group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <div className="flex overflow-hidden justify-center items-center w-11 h-11 rounded-2xl shadow-lg transition duration-300 group-hover:scale-105 group-hover:shadow-xl">
            <img
              src="/MediSync_Logo_3.png"
              alt="MediSync logo"
              className="object-cover w-full h-full"
            />
          </div>
          <span className="text-lg font-bold tracking-tight">
            <span className="text-blue-600">Medi</span>
            <span className="text-emerald-600">Sync</span>
          </span>
        </a>

        <nav className="hidden gap-1 items-center lg:flex" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              key={item}
              href={`#${item.toLowerCase().replace(/ /g, "-")}`}
            >
              {item}
            </NavLink>
          ))}
        </nav>

        <div className="hidden gap-2 items-center lg:flex">
          <a
            href="/auth/login"
            className="px-4 py-2 text-sm font-semibold rounded-xl border transition-all duration-200 border-slate-200 text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Sign In
          </a>
          <a
            href="/auth/login"
            className="group inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Get Started
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition-colors duration-200 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 lg:hidden"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div
        className="overflow-hidden transition-all duration-300 lg:hidden"
        style={{ maxHeight: menuOpen ? "400px" : "0", opacity: menuOpen ? 1 : 0 }}
        aria-hidden={!menuOpen}
      >
        <div className="px-4 py-4 border-t border-slate-100 bg-white/98 sm:px-6">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {navItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-200 text-slate-700 hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {item}
              </a>
            ))}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <a
                href="/auth/login"
                className="rounded-xl border border-slate-200 py-2.5 text-center text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Sign In
              </a>
              <a
                href="/auth/login"
                className="rounded-xl bg-blue-600 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Get Started
              </a>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
});

export default HomeHeader;
