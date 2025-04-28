FROM node:20-alpine

WORKDIR /app

ENV PRISMA_CLI_QUERY_ENGINE_TYPE="binary"

COPY auth-service/package*.json ./
RUN npm install

COPY auth-service/. ./
COPY prisma ./prisma

COPY auth-service/swagger/swagger.yaml /app/swagger.yaml

RUN npm install -g typescript && \
    npm install rimraf && \
    npx rimraf dist && \
    tsc && \
    chmod +x ./node_modules/.bin/prisma && \
    npx prisma generate --schema=./prisma/schema.prisma

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy --schema=./prisma/schema.prisma && node dist/server.js"]
