import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  label,
  value,
  href,
  accent = "primary",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  href?: string;
  accent?: "primary" | "amber" | "green" | "gray";
}) {
  const accentClasses: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    amber: "bg-amber-100 text-amber-600",
    green: "bg-green-100 text-green-600",
    gray: "bg-gray-100 text-gray-600",
  };

  const content = (
    <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-5 transition-shadow hover:shadow-sm">
      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", accentClasses[accent])}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-gray-500">{label}</p>
        <p className="text-xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }
  return content;
}
