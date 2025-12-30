import * as React from "react";
import { cn } from "@/lib/utils";

export function Separator({
  className,
  orientation = "horizontal",
}: {
  className?: string;
  orientation?: "horizontal" | "vertical";
}) {
  return (
    <div
      role="separator"
      className={cn(
        "bg-[var(--admin-border)]",
        orientation === "horizontal" ? "h-[0.5px] w-full" : "h-full w-[0.5px]",
        className
      )}
    />
  );
}














