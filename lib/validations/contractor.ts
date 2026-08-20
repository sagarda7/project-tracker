import { z } from "zod";

const phoneRegex = /^[0-9+\-\s()]{7,17}$/;

export const contractorSchema = z.object({
  name: z.string().trim().min(2, "Contractor name must be at least 2 characters"),
  companyName: z.string().trim().optional().or(z.literal("")),
  phone: z.string().trim().regex(phoneRegex, "Enter a valid phone number"),
  alternatePhone: z
    .string()
    .trim()
    .regex(phoneRegex, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  address: z.string().trim().optional().or(z.literal("")),
  contactPerson: z.string().trim().optional().or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
});

export type ContractorFormValues = z.infer<typeof contractorSchema>;
