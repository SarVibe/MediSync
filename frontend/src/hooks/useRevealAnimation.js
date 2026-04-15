import { useEffect, useRef, useState } from "react";

export default function useRevealAnimation(options = {}) {
  const {
    threshold = 0.12,
    rootMargin = "0px 0px -48px 0px",
    triggerOnce = false,
  } = options;

  const ref = useRef(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  const [isVisible, setIsVisible] = useState(prefersReducedMotion);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = (event) => {
      const matches = "matches" in event ? event.matches : mediaQuery.matches;
      setPrefersReducedMotion(matches);
      if (matches) setIsVisible(true);
    };

    syncMotionPreference(mediaQuery);
    mediaQuery.addEventListener("change", syncMotionPreference);

    return () => mediaQuery.removeEventListener("change", syncMotionPreference);
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node || prefersReducedMotion) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);

          if (triggerOnce) {
            observer.unobserve(entry.target);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [prefersReducedMotion, rootMargin, threshold, triggerOnce]);

  return { ref, isVisible, prefersReducedMotion };
}
