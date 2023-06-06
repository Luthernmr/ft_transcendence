FROM node:latest

WORKDIR /app
COPY . .

COPY package.json ./

RUN npm install
RUN npm install -g @nestjs/cli


EXPOSE 5001

CMD ["npm", "run", "start:dev"]