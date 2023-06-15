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

VOLUMES = ft_transcendence_backend-data ft_transcendence_frontend-data ft_transcendence_postgres-data ft_transcendence_pgadmin-data

clean: stop
	docker system prune -fa
	@if [ -n "$(VOLUMES)" ]; then \
		docker volume rm $(VOLUMES); \
	fi

fclean: clean

re: fclean up

.PHONY: all up down stop restart build clean fclean re
