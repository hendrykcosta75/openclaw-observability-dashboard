import React from "react";
import { mono } from "./mono";

export function SectionTitle({
  eyebrow,
  title,
  description,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-subtle" style={mono}>
          <Icon size={13} className="text-[#D4835A]" />
          {eyebrow}
        </div>
        <h2 className="text-xl font-semibold text-heading" style={mono}>{title}</h2>
        <p className="mt-1 max-w-2xl text-sm text-subtle">{description}</p>
      </div>
    </div>
  );
}
