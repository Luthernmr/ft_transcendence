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

clean: cleanDB
	docker system prune -fa

fclean: clean

cleanDB: stop
	@if [ -n "$(VOLUMES)" ]; then \
		docker volume rm $(VOLUMES); \
	fi

re: fclean up

.PHONY: all up down stop restart build clean fclean re
