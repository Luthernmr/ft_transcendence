FROM node:lts

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm ci

COPY . .

# RUN npm run build

EXPOSE 3000

COPY es.sh /es.sh
RUN chmod +x /es.sh

ENTRYPOINT ["/es.sh"]

CMD ["node", "server.cjs"]