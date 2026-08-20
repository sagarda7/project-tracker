import { z } from "zod";

export const followupNoteSchema = z.object({
  note: z.string().trim().min(2, "Note is required"),
  followupDate: z.string().trim().optional().or(z.literal("")),
  externalLink: z
    .string()
    .trim()
    .refine(
      (val) => {
        if (!val) return true;
        try {
          const url = new URL(val);
          return url.protocol === "http:" || url.protocol === "https:";
        } catch {
          return false;
        }
      },
      { message: "Enter a valid URL starting with http:// or https://" }
    )
    .optional()
    .or(z.literal("")),
});

export type FollowupNoteFormValues = z.infer<typeof followupNoteSchema>;
