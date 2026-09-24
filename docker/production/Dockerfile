FROM node:20-alpine AS base

# 1. Install dependencies only when needed
FROM base AS deps
# Prisma's query engine needs these on Alpine (musl libc).
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2. Rebuild the source code only when needed
FROM base AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# DB_PROVIDER selects which datasource this image is built against — "mysql" (default,
# talks to the shared MariaDB stack) or "postgres" (e.g. Supabase). It's a build ARG, not
# a runtime env var, because the Prisma client is generated and baked in at build time here.
# Set via DB_PROVIDER in .env.production — see docker-compose.yml's build.args.
ARG DB_PROVIDER=mysql
RUN if [ "$DB_PROVIDER" = "postgres" ]; then \
      npx prisma generate --schema=prisma/schema.postgres.prisma; \
    else \
      npx prisma generate --schema=prisma/schema.mysql.prisma; \
    fi
RUN npm run build

# 3. Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
RUN apk add --no-cache openssl

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Next's tracing usually picks up Prisma's engine, but this is copied explicitly too —
# a stale/missing engine here is a common silent-failure source in Prisma + standalone builds.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/client ./node_modules/@prisma/client

RUN mkdir -p public/uploads/projects public/uploads/followups public/uploads/complaints \
  && chown -R nextjs:nodejs public/uploads

USER nextjs

EXPOSE 3000
ENV PORT=3000

CMD HOSTNAME="0.0.0.0" node server.js
