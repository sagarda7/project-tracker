import { Prisma } from "@prisma/client";
import { UnauthorizedError, ForbiddenError } from "@/lib/auth-helpers";

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

export function actionError(e: unknown): ActionResult<never> {
  if (e instanceof UnauthorizedError || e instanceof ForbiddenError) {
    return { success: false, error: e.message };
  }
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
    return {
      success: false,
      error: "This record cannot be removed because other records still reference it.",
    };
  }
  if (e instanceof Error) {
    return { success: false, error: e.message };
  }
  return { success: false, error: "Something went wrong. Please try again." };
}
