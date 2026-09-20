import { z } from "zod";
import { COMPLAINT_STATUSES } from "@/lib/constants";

const phoneRegex = /^[0-9+\-\s()]{7,17}$/;

export const complaintSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  phone: z.string().trim().regex(phoneRegex, "Enter a valid phone number").optional().or(z.literal("")),
  description: z.string().trim().min(10, "Please describe your complaint in at least 10 characters"),
  province: z.string().trim().min(1, "Province is required"),
  district: z.string().trim().min(1, "District is required"),
  municipality: z.string().trim().min(1, "Municipality/VDC is required"),
  ward: z.string().trim().min(1, "Ward is required"),
  addressDetail: z.string().trim().optional().or(z.literal("")),
});

export type ComplaintFormValues = z.infer<typeof complaintSchema>;

export const trackCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(5, "Enter your 5-character tracking code")
    .max(5, "Enter your 5-character tracking code"),
});

export const complaintStatusUpdateSchema = z.object({
  status: z.enum(COMPLAINT_STATUSES as [string, ...string[]]),
  comment: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const complaintNoteSchema = z.object({
  note: z.string().trim().min(2, "Note is required"),
});

export type ComplaintNoteFormValues = z.infer<typeof complaintNoteSchema>;
