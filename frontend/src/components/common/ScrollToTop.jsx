// src/components/common/ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // jump to top whenever the route changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // or "smooth" if you want animation
    });
  }, [pathname]);

  return null; // this component doesn't render anything
}
