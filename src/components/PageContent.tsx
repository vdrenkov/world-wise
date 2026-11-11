import { useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router";

import type { ReactNode } from "react";

export default function PageContent({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const contentRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useLayoutEffect(() => {
    if (navigationType !== "POP") {
      contentRef.current?.focus();
    }
  }, [pathname, navigationType]);

  return (
    <section
      id="page-content"
      className={`page-content ${className}`}
      ref={contentRef}
      tabIndex={-1}
    >
      {children}
    </section>
  );
}
