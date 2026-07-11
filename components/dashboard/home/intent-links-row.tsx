"use client";

import Link from "next/link";
import { useSnapshot } from "@/components/dashboard/snapshot-context";
import { mono } from "../shared/mono";

export function IntentLinksRow() {
  const { intentLinks } = useSnapshot();

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
