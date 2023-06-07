FROM node:latest

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm ci

COPY . .

EXPOSE 5001

CMD ["npm", "run", "start:dev"]
