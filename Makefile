NAME	= transcendence
#VOLUMES	= $(shell echo | docker volume ls -q)

all:	${NAME}

${NAME}:	
			#make clean
			make up

up:volumes			
			docker-compose --file docker-compose.yml up -d --build

down:		
			docker-compose --file docker-compose.yml down

clean:		
			docker system prune -af --volumes
			rm -rf /home/$USER/data/*

fclean:		clean

re:			down fclean all

volumes:
	mkdir -p ~/frontend
	mkdir -p ~/backend

.PHONY: all up down clean fclean re
