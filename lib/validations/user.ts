import { z } from "zod";
import { LANGUAGES, ROLES } from "@/lib/constants";

const phoneRegex = /^[0-9+\-\s()]{7,17}$/;

export const createUserSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().regex(phoneRegex, "Enter a valid phone number").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(ROLES as [string, ...string[]]),
  language: z.enum(LANGUAGES as [string, ...string[]]),
});

export const updateUserSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().regex(phoneRegex, "Enter a valid phone number").optional().or(z.literal("")),
  role: z.enum(ROLES as [string, ...string[]]),
  language: z.enum(LANGUAGES as [string, ...string[]]),
  isActive: z.boolean(),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  phone: z.string().trim().regex(phoneRegex, "Enter a valid phone number").optional().or(z.literal("")),
  language: z.enum(LANGUAGES as [string, ...string[]]),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
export type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
