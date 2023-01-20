NAME	= transcendence

VOLUMES	= $(shell echo | docker volume ls -q)

all:	${NAME}

${NAME}:	
			#make clean
			make up

up:			
			docker compose -f docker-compose.yml up -d --build

down:		
			docker compose -f docker-compose.yml down

clean:		
			docker system prune -fa

fclean:		clean

re:			down fclean all

.PHONY: all up down clean fclean re