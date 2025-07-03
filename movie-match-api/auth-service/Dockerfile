# Etapa 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY auth-service/package*.json ./
RUN npm ci
COPY auth-service/ ./
COPY prisma ./prisma
RUN npm run build && npx prisma generate
RUN npm prune --production

# Etapa 2: Imagen final mínima
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY auth-service/swagger/swagger.yaml ./swagger.yaml

COPY wait-for.sh /wait-for.sh
RUN chmod +x /wait-for.sh

CMD ["sh", "/wait-for.sh", "node", "dist/server.js"]
