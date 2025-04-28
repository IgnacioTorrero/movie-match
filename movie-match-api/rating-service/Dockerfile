FROM node:20-alpine

WORKDIR /app

ENV PRISMA_CLI_QUERY_ENGINE_TYPE="binary"

COPY rating-service/package*.json ./
RUN npm install

RUN npm install -g typescript

COPY rating-service/. ./
COPY prisma ./prisma

COPY rating-service/swagger/swagger.yaml /app/swagger.yaml

RUN chmod +x ./node_modules/.bin/prisma

RUN rm -rf dist && \
    npm run build && \
    npx prisma generate --schema=./prisma/schema.prisma

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy --schema=./prisma/schema.prisma && node dist/server.js"]
