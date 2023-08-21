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

EXPOSE 5000

ENTRYPOINT ["/bcrypt.sh"]

#RUN npm run build

CMD ["npm", "run", "start:dev"]