FROM node:15-alpine

COPY /src/frontend/package*.json ./app/frontend/
COPY /src/server/package*.json ./app/server/

COPY ./src /app/

WORKDIR /app

RUN cd /app/server && npm install && cd /app/frontend && npm install && npm run build

WORKDIR /app/server
CMD [ "node", "server.js" ]