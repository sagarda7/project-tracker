import { z } from "zod";
import { GOVERNING_BODIES, PROJECT_STATUSES } from "@/lib/constants";

const phoneRegex = /^[0-9+\-\s()]{7,17}$/;

export const projectSchema = z
  .object({
    name: z.string().trim().min(3, "Project name must be at least 3 characters"),
    province: z.string().trim().min(1, "Province is required"),
    district: z.string().trim().min(1, "District is required"),
    municipality: z.string().trim().min(1, "Municipality/VDC is required"),
    ward: z.string().trim().min(1, "Ward is required"),
    locationDescription: z.string().trim().optional().or(z.literal("")),
    contractorId: z.string().trim().optional().or(z.literal("")),
    contractorName: z.string().trim().optional().or(z.literal("")),
    contractorPhone: z
      .string()
      .trim()
      .regex(phoneRegex, "Enter a valid phone number")
      .optional()
      .or(z.literal("")),
    contactPersonName: z.string().trim().optional().or(z.literal("")),
    contactPersonPhone: z
      .string()
      .trim()
      .regex(phoneRegex, "Enter a valid phone number")
      .optional()
      .or(z.literal("")),
    governingBody: z.enum(GOVERNING_BODIES as [string, ...string[]], {
      message: "Governing body is required",
    }),
    status: z.enum(PROJECT_STATUSES as [string, ...string[]], {
      message: "Status is required",
    }),
    budget: z
      .string()
      .trim()
      .min(1, "Budget is required")
      .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, "Budget must be a positive number"),
    startDate: z.string().trim().optional().or(z.literal("")),
    deadline: z.string().trim().optional().or(z.literal("")),
    description: z.string().trim().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.deadline) return true;
      return new Date(data.deadline) >= new Date(data.startDate);
    },
    { message: "Deadline must be on or after the start date", path: ["deadline"] }
  );

export type ProjectFormValues = z.infer<typeof projectSchema>;

export const statusUpdateSchema = z.object({
  status: z.enum(PROJECT_STATUSES as [string, ...string[]]),
  comment: z.string().trim().max(1000).optional().or(z.literal("")),
});
