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
# throwaway image and run a one-off `prisma` command against it on the shared network.

.PHONY: db-push-production
db-push-production: ## Sync the production DB schema (prisma db push, schema.mysql.prisma).
	docker build --target builder -f docker/production/Dockerfile -t rspchitwan-prod-builder .
	bash -c 'set -a; source docker/production/.env.production; set +a; \
		docker run --rm --network "$$SHARED_NETWORK_NAME" -e DATABASE_URL="$$DATABASE_URL" \
		rspchitwan-prod-builder npx prisma db push --schema=prisma/schema.mysql.prisma'

.PHONY: db-seed-production
db-seed-production: ## Seed the production database (idempotent — safe to re-run).
	docker build --target builder -f docker/production/Dockerfile -t rspchitwan-prod-builder .
	bash -c 'set -a; source docker/production/.env.production; set +a; \
		docker run --rm --network "$$SHARED_NETWORK_NAME" -e DATABASE_URL="$$DATABASE_URL" \
		rspchitwan-prod-builder npx tsx prisma/seed.ts'

.PHONY: db-push-staging
db-push-staging: ## Sync the staging DB schema (prisma db push, schema.mysql.prisma).
	docker build --target builder -f docker/staging/Dockerfile -t rspchitwan-staging-builder .
	bash -c 'set -a; source docker/staging/.env.staging; set +a; \
		docker run --rm --network "$$SHARED_NETWORK_NAME" -e DATABASE_URL="$$DATABASE_URL" \
		rspchitwan-staging-builder npx prisma db push --schema=prisma/schema.mysql.prisma'

.PHONY: db-seed-staging
db-seed-staging: ## Seed the staging database (idempotent — safe to re-run).
	docker build --target builder -f docker/staging/Dockerfile -t rspchitwan-staging-builder .
	bash -c 'set -a; source docker/staging/.env.staging; set +a; \
		docker run --rm --network "$$SHARED_NETWORK_NAME" -e DATABASE_URL="$$DATABASE_URL" \
		rspchitwan-staging-builder npx tsx prisma/seed.ts'
