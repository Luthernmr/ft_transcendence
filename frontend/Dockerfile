FROM node:latest

WORKDIR /app

COPY es.sh /es.sh

RUN chmod +x /es.sh

COPY package.json ./

COPY . .

RUN npm install


EXPOSE 3000

ENTRYPOINT ["/es.sh"]

CMD ["npm", "run", "dev"]