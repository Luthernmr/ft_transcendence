NAME = ft_transcendence

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
	docker system prune -fa
	@if [ -n "$(VOLUMES)" ]; then \
		docker volume rm $(VOLUMES); \
	fi

fclean: clean

re: fclean up

.PHONY: all up down stop restart build clean fclean re
