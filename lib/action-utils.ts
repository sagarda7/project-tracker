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
    // P2003 fires both when a delete is blocked by a still-referencing record (e.g.
    // deleting a user who created projects) AND when a write references an id that no
    // longer exists — phrasing this as "cannot be removed" would be wrong for the latter.
    return {
      success: false,
      error:
        "This action failed because it references a related record that no longer exists, " +
        "or that record still has other data depending on it. Please refresh and try again.",
    };
  }
  if (e instanceof Error) {
    return { success: false, error: e.message };
  }
  return { success: false, error: "Something went wrong. Please try again." };
}
