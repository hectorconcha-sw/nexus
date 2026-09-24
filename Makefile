.PHONY: help up down restart logs ps psql redis-cli clean

help: ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

up: ## Start the local stack
	docker compose up -d
	@echo ""
	@echo "Nexus local stack is up:"
	@echo "  Postgres     → localhost:$${POSTGRES_PORT:-5432}"
	@echo "  Redis        → localhost:$${REDIS_PORT:-6379}"
	@echo "  Adminer      → http://localhost:$${ADMINER_PORT:-8080}"
	@echo "  RedisInsight → http://localhost:$${REDISINSIGHT_PORT:-8001}"

down: ## Stop the stack (keeps data)
	docker compose down

restart: ## Restart the stack
	docker compose restart

logs: ## Tail logs from all services
	docker compose logs -f --tail=100

ps: ## Show container status
	docker compose ps

psql: ## Open a psql shell in the Postgres container
	docker compose exec postgres psql -U $${POSTGRES_USER:-nexus} -d $${POSTGRES_DB:-nexus}

redis-cli: ## Open a redis-cli shell
	docker compose exec redis redis-cli -a $${REDIS_PASSWORD:-nexus_dev_password}

clean: ## Stop the stack and remove volumes (DESTROYS DATA)
	docker compose down -v