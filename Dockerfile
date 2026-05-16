FROM node:24-alpine

COPY package.json package-lock.json /app/
WORKDIR /app

RUN npm i
RUN npm i -g serve

COPY . /app

RUN npm run build

EXPOSE 3000

CMD ["serve", "-s", "dist"]
