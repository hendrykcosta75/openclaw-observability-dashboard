"use client";

import Link from "next/link";
import { intentLinks } from "@/lib/openclaw-snapshot";
import { mono } from "../shared/mono";

export function IntentLinksRow() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2" data-testid="intent-links-row">
      {intentLinks.map((link) => (
        <Link
          key={link.href + link.label}
          href={link.href}
          className="text-xs text-subtle transition-colors hover:text-heading"
          style={mono}
        >
          {link.label} →
        </Link>
      ))}
    </div>
  );
}
