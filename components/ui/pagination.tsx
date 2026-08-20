"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function goTo(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.push(`?${params.toString()}`);
  }

  if (totalPages <= 1) return null;

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 px-4 py-3 sm:flex-row">
      <p className="text-sm text-gray-600">
        Showing <span className="font-medium">{startItem}</span>–
        <span className="font-medium">{endItem}</span> of{" "}
        <span className="font-medium">{totalItems}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => goTo(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center rounded-md border border-gray-300 p-1.5 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: totalPages })
          .map((_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce<number[]>((acc, p) => {
            if (acc.length > 0 && p - acc[acc.length - 1] > 1) acc.push(-1);
            acc.push(p);
            return acc;
          }, [])
          .map((p, idx) =>
            p === -1 ? (
              <span key={`gap-${idx}`} className="px-1 text-gray-400">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => goTo(p)}
                className={cn(
                  "min-w-[2rem] rounded-md px-2 py-1.5 text-sm font-medium",
                  p === page ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
                )}
              >
                {p}
              </button>
            )
          )}
        <button
          type="button"
          onClick={() => goTo(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex items-center rounded-md border border-gray-300 p-1.5 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
