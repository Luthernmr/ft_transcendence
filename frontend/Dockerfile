FROM node:lts

ARG FRONTEND_PORT_INT

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm ci

COPY . .

EXPOSE ${FRONTEND_PORT_INT}

COPY es.sh /es.sh
RUN chmod +x /es.sh

ENTRYPOINT ["/es.sh"]

CMD ["node", "server.cjs"]