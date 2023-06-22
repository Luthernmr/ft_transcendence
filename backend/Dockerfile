FROM node:lts

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
COPY bcrypt.sh /bcrypt.sh
RUN chmod +x /bcrypt.sh

RUN npm ci

ENV TZ=Europe/Paris
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

COPY . .

EXPOSE 5001

ENTRYPOINT ["/bcrypt.sh"]

CMD ["npm", "run", "start:dev"]
