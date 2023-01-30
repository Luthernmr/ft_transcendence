NAME	= transcendence
#VOLUMES	= $(shell echo | docker volume ls -q)
all:	${NAME}

${NAME}:	
			#make clean
			make up

up:		
			docker-compose --file docker-compose.yml up -d --build

down:		
			docker-compose --file docker-compose.yml down

clean:		
			docker system prune -af --volumes

fclean:		clean

re:			down fclean all

.PHONY: all up down clean fclean re
