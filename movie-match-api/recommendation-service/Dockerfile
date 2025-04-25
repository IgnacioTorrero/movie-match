FROM node:20-alpine

WORKDIR /app

ENV PRISMA_CLI_QUERY_ENGINE_TYPE="binary"

COPY recommendation-service/package*.json ./
RUN npm install

COPY recommendation-service/. ./
COPY prisma ./prisma

RUN npm run build && \
    chmod +x ./node_modules/.bin/prisma && \
    npx prisma generate --schema=./prisma/schema.prisma

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy --schema=./prisma/schema.prisma && node dist/server.js"]
