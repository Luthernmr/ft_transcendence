FROM node:lts

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

COPY es.sh /es.sh
RUN chmod +x /es.sh

RUN npm ci

RUN npm install -g serve

COPY . .

ENTRYPOINT ["/es.sh"]

CMD ["npm", "run", "build"]

CMD serve -s dist -l 3000

EXPOSE 3000