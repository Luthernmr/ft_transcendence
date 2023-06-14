FROM node:lts

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
COPY bcrypt.sh /bcrypt.sh
RUN chmod +x /bcrypt.sh

RUN npm ci

COPY . .

EXPOSE 5000

ENTRYPOINT ["/bcrypt.sh"]

CMD ["npm", "run", "start:dev"]
