import { memo } from "react";
import useRevealAnimation from "../../hooks/useRevealAnimation";

const TIMING_FUNCTION = "cubic-bezier(0.22, 1, 0.36, 1)";

function getHiddenTransform(direction, distance) {
  switch (direction) {
    case "down":
      return `translate3d(0, -${distance}px, 0)`;
    case "left":
      return `translate3d(${distance}px, 0, 0)`;
    case "right":
      return `translate3d(-${distance}px, 0, 0)`;
    case "up":
    default:
      return `translate3d(0, ${distance}px, 0)`;
  }
}

const RevealOnScroll = memo(function RevealOnScroll({
  as = "div",
  children,
  className = "",
  style,
  direction = "up",
  delay = 0,
  duration = 700,
  distance = 24,
  threshold = 0.12,
  rootMargin = "0px 0px -48px 0px",
  triggerOnce = false,
  ...rest
}) {
  const Component = as;
  const { ref, isVisible, prefersReducedMotion } = useRevealAnimation({
    threshold,
    rootMargin,
    triggerOnce,
  });

  const revealStyle = prefersReducedMotion
    ? style
    : {
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? "translate3d(0, 0, 0)"
          : getHiddenTransform(direction, distance),
        transition: `opacity ${duration}ms ${TIMING_FUNCTION} ${delay}ms, transform ${duration}ms ${TIMING_FUNCTION} ${delay}ms`,
        willChange: isVisible ? "auto" : "opacity, transform",
        ...style,
      };

  return (
    <Component ref={ref} className={className} style={revealStyle} {...rest}>
      {children}
    </Component>
  );
});

export default RevealOnScroll;
