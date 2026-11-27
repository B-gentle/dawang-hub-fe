"use client";

import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "rectangular" | "circular" | "text";
  tone?: "default" | "muted" | "surface";
  animate?: boolean;
}

const TONE_CLASSES: Record<NonNullable<SkeletonProps["tone"]>, string> = {
  default: "bg-[#EAE8E4]",
  muted: "bg-[#EAE8E4]/70",
  surface: "bg-[#FAF9F6] border border-[#EAE8E4]/80",
};

const VARIANT_CLASSES: Record<NonNullable<SkeletonProps["variant"]>, string> = {
  rectangular: "rounded-md",
  circular: "rounded-full",
  text: "rounded h-3.5",
};

export function Skeleton({
  variant = "rectangular",
  tone = "default",
  animate = true,
  className = "",
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        TONE_CLASSES[tone],
        VARIANT_CLASSES[variant],
        animate ? "animate-pulse" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

export default Skeleton;
