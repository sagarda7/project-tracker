.PHONY: build-staging
build-staging: ## Build the staging docker image.
	docker compose -f docker/staging/docker-compose.yml --env-file docker/staging/.env.staging build

.PHONY: start-staging
start-staging: ## Start the staging docker container.
	docker compose -f docker/staging/docker-compose.yml --env-file docker/staging/.env.staging up -d

.PHONY: stop-staging
stop-staging: ## Stop the staging docker container.
	docker compose -f docker/staging/docker-compose.yml --env-file docker/staging/.env.staging down

.PHONY: logs-staging
logs-staging: ## Follow the staging container's logs.
	docker compose -f docker/staging/docker-compose.yml --env-file docker/staging/.env.staging logs -f app

.PHONY: build-production
build-production: ## Build the production docker image.
	docker compose -f docker/production/docker-compose.yml --env-file docker/production/.env.production build

.PHONY: start-production
start-production: ## Start the production docker container.
	docker compose -f docker/production/docker-compose.yml --env-file docker/production/.env.production up -d

.PHONY: stop-production
stop-production: ## Stop the production docker container.
	docker compose -f docker/production/docker-compose.yml --env-file docker/production/.env.production down

.PHONY: logs-production
logs-production: ## Follow the production container's logs.
	docker compose -f docker/production/docker-compose.yml --env-file docker/production/.env.production logs -f app

# --- Database (schema sync + seed) ---
# The runtime image is intentionally slim (Next standalone output) and doesn't carry the
# Prisma CLI. These targets build just the "builder" stage (which has it) into a
# throwaway image and run a one-off `prisma`/seed command against it on the shared
# network. `docker run --env-file` forwards every variable in the env file into the
# container in one shot (SEED_ADMIN_*, DATABASE_URL, AUTH_SECRET, etc.) — note that
# Docker's env-file parser does NOT strip quotes (unlike a shell), so values in these
# files must be unquoted even if they contain spaces (e.g. SEED_ADMIN_NAME=System
# Administrator, no quotes) or the quote characters end up literally in the value.
#
# SHARED_NETWORK_NAME and DB_PROVIDER still need pulling out separately with grep/cut
# (not `source`, which chokes on exactly those unquoted multi-word values): --network is
# a docker-run CLI flag that --env-file has no way to populate, and DB_PROVIDER has to
# pick the schema file and get passed as a --build-arg before the container even exists.
# DB_PROVIDER defaults to mysql if unset, matching the Dockerfile's own ARG default.

.PHONY: db-push-production
db-push-production: ## Sync the production DB schema (prisma db push; mysql or postgres, per DB_PROVIDER).
	@DB_PROVIDER="$$(grep '^DB_PROVIDER=' docker/production/.env.production | cut -d= -f2-)"; \
	DB_PROVIDER="$${DB_PROVIDER:-mysql}"; \
	if [ "$$DB_PROVIDER" = "postgres" ]; then SCHEMA=prisma/schema.postgres.prisma; else SCHEMA=prisma/schema.mysql.prisma; fi; \
	docker build --target builder --build-arg DB_PROVIDER="$$DB_PROVIDER" -f docker/production/Dockerfile -t rspchitwan-prod-builder . && \
	docker run --rm \
		--network "$$(grep '^SHARED_NETWORK_NAME=' docker/production/.env.production | cut -d= -f2-)" \
		--env-file docker/production/.env.production \
		rspchitwan-prod-builder npx prisma db push --schema=$$SCHEMA

.PHONY: db-seed-production
db-seed-production: ## Seed the production database (idempotent — safe to re-run).
	@DB_PROVIDER="$$(grep '^DB_PROVIDER=' docker/production/.env.production | cut -d= -f2-)"; \
	DB_PROVIDER="$${DB_PROVIDER:-mysql}"; \
	docker build --target builder --build-arg DB_PROVIDER="$$DB_PROVIDER" -f docker/production/Dockerfile -t rspchitwan-prod-builder . && \
	docker run --rm \
		--network "$$(grep '^SHARED_NETWORK_NAME=' docker/production/.env.production | cut -d= -f2-)" \
		--env-file docker/production/.env.production \
		rspchitwan-prod-builder npx tsx prisma/seed.ts

.PHONY: db-push-staging
db-push-staging: ## Sync the staging DB schema (prisma db push; mysql or postgres, per DB_PROVIDER).
	@DB_PROVIDER="$$(grep '^DB_PROVIDER=' docker/staging/.env.staging | cut -d= -f2-)"; \
	DB_PROVIDER="$${DB_PROVIDER:-mysql}"; \
	if [ "$$DB_PROVIDER" = "postgres" ]; then SCHEMA=prisma/schema.postgres.prisma; else SCHEMA=prisma/schema.mysql.prisma; fi; \
	docker build --target builder --build-arg DB_PROVIDER="$$DB_PROVIDER" -f docker/staging/Dockerfile -t rspchitwan-staging-builder . && \
	docker run --rm \
		--network "$$(grep '^SHARED_NETWORK_NAME=' docker/staging/.env.staging | cut -d= -f2-)" \
		--env-file docker/staging/.env.staging \
		rspchitwan-staging-builder npx prisma db push --schema=$$SCHEMA

.PHONY: db-seed-staging
db-seed-staging: ## Seed the staging database (idempotent — safe to re-run).
	@DB_PROVIDER="$$(grep '^DB_PROVIDER=' docker/staging/.env.staging | cut -d= -f2-)"; \
	DB_PROVIDER="$${DB_PROVIDER:-mysql}"; \
	docker build --target builder --build-arg DB_PROVIDER="$$DB_PROVIDER" -f docker/staging/Dockerfile -t rspchitwan-staging-builder . && \
	docker run --rm \
		--network "$$(grep '^SHARED_NETWORK_NAME=' docker/staging/.env.staging | cut -d= -f2-)" \
		--env-file docker/staging/.env.staging \
		rspchitwan-staging-builder npx tsx prisma/seed.ts
