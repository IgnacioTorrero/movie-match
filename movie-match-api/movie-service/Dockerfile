FROM node:20-alpine

WORKDIR /app

ENV PRISMA_CLI_QUERY_ENGINE_TYPE="binary"

COPY movie-service/package*.json ./
RUN npm install

COPY movie-service/. ./
COPY prisma ./prisma

RUN npm install -g typescript && \
    npm install rimraf && \
    chmod +x ./node_modules/.bin/rimraf && \
    ./node_modules/.bin/rimraf dist && \
    tsc && \
    chmod +x ./node_modules/.bin/prisma && \
    npx prisma generate --schema=./prisma/schema.prisma

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy --schema=./prisma/schema.prisma && node dist/server.js"]
