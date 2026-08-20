import { GoverningBody, ProjectStatus, Role, Language } from "@prisma/client";

export const PROJECT_STATUSES: ProjectStatus[] = [
  "PLANNED",
  "BID",
  "STARTED",
  "PROGRESS",
  "HALTED",
  "CANCELED",
  "COMPLETED",
  "HANDOVER",
];

export const NON_OVERDUE_STATUSES: ProjectStatus[] = [
  "COMPLETED",
  "HANDOVER",
  "CANCELED",
];

export const STATUS_BADGE_CLASSES: Record<ProjectStatus, string> = {
  PLANNED: "bg-gray-100 text-gray-700 border-gray-200",
  BID: "bg-purple-100 text-purple-700 border-purple-200",
  STARTED: "bg-sky-100 text-sky-700 border-sky-200",
  PROGRESS: "bg-blue-100 text-blue-700 border-blue-200",
  HALTED: "bg-amber-100 text-amber-700 border-amber-200",
  CANCELED: "bg-red-100 text-red-700 border-red-200",
  COMPLETED: "bg-green-100 text-green-700 border-green-200",
  HANDOVER: "bg-teal-100 text-teal-700 border-teal-200",
};

export const GOVERNING_BODIES: GoverningBody[] = [
  "METROPOLITAN_CITY",
  "SUB_METROPOLITAN_CITY",
  "MUNICIPALITY",
  "RURAL_MUNICIPALITY",
  "URBAN_DEVELOPMENT",
  "INFRASTRUCTURE_DEVELOPMENT",
  "OTHER",
];

export const GOVERNING_BODY_LABELS: Record<GoverningBody, string> = {
  METROPOLITAN_CITY: "Metropolitan City",
  SUB_METROPOLITAN_CITY: "Sub-Metropolitan City",
  MUNICIPALITY: "Municipality",
  RURAL_MUNICIPALITY: "Rural Municipality",
  URBAN_DEVELOPMENT: "Urban Development",
  INFRASTRUCTURE_DEVELOPMENT: "Infrastructure Development",
  OTHER: "Other",
};

export const ROLES: Role[] = ["ADMIN", "USER"];

export const LANGUAGES: Language[] = ["EN", "NE"];

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const PAGE_SIZE = 10;

export function isOverdue(
  deadline: Date | string | null,
  status: ProjectStatus
): boolean {
  if (!deadline) return false;
  if (NON_OVERDUE_STATUSES.includes(status)) return false;
  const deadlineDate = new Date(deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return deadlineDate < today;
}
