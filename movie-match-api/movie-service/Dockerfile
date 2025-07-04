# Etapa 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY movie-service/package*.json ./
RUN npm ci
COPY movie-service/ ./
COPY prisma ./prisma
RUN npm run build && npx prisma generate

# Etapa 2: Imagen final
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY movie-service/swagger/swagger.yaml ./swagger.yaml

COPY wait-for.sh /wait-for.sh
RUN chmod +x /wait-for.sh

EXPOSE 3000

CMD ["sh", "/wait-for.sh", "node", "dist/server.js"]
