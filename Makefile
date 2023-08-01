NAME = ft_transcendence

VOLUMES	= $(shell echo | docker volume ls -q)

all: up

up: build
	docker-compose -f docker-compose.yml up -d

down:
	docker-compose -f docker-compose.yml down

stop:
	docker-compose -f docker-compose.yml stop

restart: down up

build:
	docker-compose -f docker-compose.yml build

clean: stop
	@echo "Cleaning up..."
	docker system prune -fa
	@if [ -n "$(VOLUMES)" ]; then \
		docker volume rm $(VOLUMES); \
	fi

clean_folders:
	@echo "Removing backend/dist and backend/node_modules..."
	rm -rf backend/dist backend/node_modules backend/package-lock.json
	@echo "Removing frontend/node_modules..."
	rm -rf frontend/dist frontend/node_modules frontend/package-lock.json

fclean: clean clean_folders

re: fclean up

.PHONY: all up down stop restart build clean clean_folders fclean re
