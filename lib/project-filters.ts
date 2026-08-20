export interface ProjectFilters {
  q: string;
  status: string;
  province: string;
  district: string;
  governingBody: string;
  deadlineFrom: string;
  deadlineTo: string;
  budgetMin: string;
  budgetMax: string;
  view: "all" | "overdue";
  sort: string;
  page: string;
}

export const DEFAULT_FILTERS: ProjectFilters = {
  q: "",
  status: "",
  province: "",
  district: "",
  governingBody: "",
  deadlineFrom: "",
  deadlineTo: "",
  budgetMin: "",
  budgetMax: "",
  view: "all",
  sort: "createdAt:desc",
  page: "1",
};

export function parseFilters(searchParams: Record<string, string | undefined>): ProjectFilters {
  return {
    q: searchParams.q ?? "",
    status: searchParams.status ?? "",
    province: searchParams.province ?? "",
    district: searchParams.district ?? "",
    governingBody: searchParams.governingBody ?? "",
    deadlineFrom: searchParams.deadlineFrom ?? "",
    deadlineTo: searchParams.deadlineTo ?? "",
    budgetMin: searchParams.budgetMin ?? "",
    budgetMax: searchParams.budgetMax ?? "",
    view: searchParams.view === "overdue" ? "overdue" : "all",
    sort: searchParams.sort ?? DEFAULT_FILTERS.sort,
    page: searchParams.page ?? "1",
  };
}

export const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "createdAt:asc", label: "Oldest first" },
  { value: "deadline:asc", label: "Deadline (soonest)" },
  { value: "deadline:desc", label: "Deadline (latest)" },
  { value: "budget:desc", label: "Budget (highest)" },
  { value: "budget:asc", label: "Budget (lowest)" },
  { value: "name:asc", label: "Name (A-Z)" },
];
