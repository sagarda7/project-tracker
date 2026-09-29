import "server-only";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export class UnauthorizedError extends Error {
  constructor(message = "You must be signed in to do this.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "You do not have permission to do this.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/** Server-side session guard. Every Server Action must call this — proxy-level route
 * protection alone does not cover Server Action invocations reliably.
 *
 * Also re-checks the user still exists in the DB: sessions are JWTs (see auth.ts), so a
 * session issued before a `db push`/reseed (which assigns fresh cuids) keeps "looking" valid
 * — id/email/role are just replayed from the token — right up until an action tries to write
 * that stale id as a foreign key (createdById, changedById, ...) and Prisma rejects it with a
 * P2003 the user has no way to make sense of. Catching it here instead gives a clear,
 * actionable message. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();

  const exists = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  });
  if (!exists) {
    throw new UnauthorizedError("Your session is no longer valid. Please log out and log back in.");
  }

  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new ForbiddenError();
  return user;
}
