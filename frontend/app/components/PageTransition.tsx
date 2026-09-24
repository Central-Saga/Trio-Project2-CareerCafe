"use client";

import { useEffect, useState } from "react";

type PageTransitionProps = {
  children: React.ReactNode;
  className?: string;
};

export default function PageTransition({
  children,
  className = "",
}: PageTransitionProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setVisible(true);
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      className={[
        "transition-[opacity,transform,filter]",
        "duration-700",
        "ease-[cubic-bezier(0.22,1,0.36,1)]",
        visible
          ? "translate-y-0 scale-100 opacity-100 blur-0"
          : "translate-y-5 scale-[0.985] opacity-0 blur-[2px]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
