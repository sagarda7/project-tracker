"use client";

import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { CalendarIcon, X } from "lucide-react";
import { formatDate, formatDateInput } from "@/lib/utils";

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  id,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const selectedDate = value ? new Date(value) : undefined;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-500"
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {value ? formatDate(selectedDate) : placeholder}
        </span>
        <span className="flex items-center gap-1">
          {value && (
            <span
              role="button"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="rounded p-0.5 text-gray-400 hover:text-gray-600"
              aria-label="Clear date"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <CalendarIcon className="h-4 w-4 text-gray-400" />
        </span>
      </button>
      {open && (
        <div className="absolute z-20 mt-1 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              onChange(date ? formatDateInput(date) : "");
              setOpen(false);
            }}
            captionLayout="dropdown"
            classNames={{
              today: "text-primary font-semibold",
              selected: "bg-primary text-white rounded-md",
              chevron: "fill-primary",
            }}
          />
        </div>
      )}
    </div>
  );
}
