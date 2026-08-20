import { z } from "zod";
import { GOVERNING_BODIES, PROJECT_STATUSES } from "@/lib/constants";

const phoneRegex = /^[0-9+\-\s()]{7,17}$/;

export const projectCsvRowSchema = z.object({
  name: z.string().trim().min(3, "Project name must be at least 3 characters"),
  province: z.string().trim().min(1, "Province is required"),
  district: z.string().trim().min(1, "District is required"),
  municipality: z.string().trim().min(1, "Municipality/VDC is required"),
  ward: z.string().trim().min(1, "Ward is required"),
  locationDescription: z.string().trim().optional().or(z.literal("")),
  contractorName: z.string().trim().optional().or(z.literal("")),
  contractorPhone: z
    .string()
    .trim()
    .regex(phoneRegex, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  contactPersonName: z.string().trim().optional().or(z.literal("")),
  contactPersonPhone: z
    .string()
    .trim()
    .regex(phoneRegex, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  governingBody: z.enum(GOVERNING_BODIES as [string, ...string[]], {
    message: `Must be one of: ${GOVERNING_BODIES.join(", ")}`,
  }),
  status: z.enum(PROJECT_STATUSES as [string, ...string[]], {
    message: `Must be one of: ${PROJECT_STATUSES.join(", ")}`,
  }),
  budget: z
    .string()
    .trim()
    .min(1, "Budget is required")
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, "Budget must be a positive number"),
  startDate: z.string().trim().optional().or(z.literal("")),
  deadline: z.string().trim().optional().or(z.literal("")),
  description: z.string().trim().optional().or(z.literal("")),
});

export type ProjectCsvRow = z.infer<typeof projectCsvRowSchema>;

export const PROJECT_CSV_COLUMNS: (keyof ProjectCsvRow)[] = [
  "name",
  "province",
  "district",
  "municipality",
  "ward",
  "locationDescription",
  "contractorName",
  "contractorPhone",
  "contactPersonName",
  "contactPersonPhone",
  "governingBody",
  "status",
  "budget",
  "startDate",
  "deadline",
  "description",
];

export const contractorCsvRowSchema = z.object({
  name: z.string().trim().min(2, "Contractor name must be at least 2 characters"),
  companyName: z.string().trim().optional().or(z.literal("")),
  phone: z.string().trim().regex(phoneRegex, "Invalid phone number"),
  alternatePhone: z.string().trim().regex(phoneRegex, "Invalid phone number").optional().or(z.literal("")),
  email: z.string().trim().email("Invalid email").optional().or(z.literal("")),
  address: z.string().trim().optional().or(z.literal("")),
  contactPerson: z.string().trim().optional().or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
});

export type ContractorCsvRow = z.infer<typeof contractorCsvRowSchema>;

export const CONTRACTOR_CSV_COLUMNS: (keyof ContractorCsvRow)[] = [
  "name",
  "companyName",
  "phone",
  "alternatePhone",
  "email",
  "address",
  "contactPerson",
  "notes",
];
