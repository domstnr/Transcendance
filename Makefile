all: check-env
	docker compose up -d --build;

up: check-env
	docker compose up -d;

down:
	docker compose down

status:
	docker compose ps

re: down all

clean:
	@if docker ps -q | grep -q .; then \
		docker stop $$(docker ps -q) || true;\
	else \
		echo "Dockers are already stopped!"; \
	fi
	@if docker ps -qa | grep -q .; then \
		docker rm $$(docker ps -qa) || true;\
	else \
		echo "Dockers are already removed!"; \
	fi
	@if docker images -qa | grep -q .; then \
		docker rmi -f $$(docker images -qa) || true;\
	else \
		echo "Dockers images are already deleted!"; \
	fi
	@if docker volume ls -q | grep -q .; then \
		docker volume rm $$(docker volume ls -q) || true;\
	else \
		echo "Dockers volumes are already deleted!"; \
	fi
	@if docker network ls -q --filter "type=custom" | grep -q .; then \
		docker network rm $$(docker network ls -q --filter "type=custom") || true;\
	else \
		echo "Dockers networks are already deleted!"; \
	fi
	@echo Cleanup finished!

check-env:
	@test -f .env || (printf "\033[31mError: .env file not found\033[0m\n"; exit 1)

backup:
	docker exec -it db-backup bash -c 'pg_dump --clean --if-exists -h $$POSTGRES_HOST -U $$POSTGRES_USER $$POSTGRES_DB | gzip > /backups/manual_backup_$$(date +%Y%m%d_%H%M%S).sql.gz && echo "Backup done."'

restore:
	bash scripts/restore.sh

certs:
	mkdir -p nginx/certs
	openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
		-keyout nginx/certs/key.pem \
		-out nginx/certs/cert.pem \
		-subj "/CN=localhost"


