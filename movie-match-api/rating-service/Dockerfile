# Etapa 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY rating-service/package*.json ./
RUN npm ci
COPY rating-service/ ./
COPY prisma ./prisma
RUN npm run build && npx prisma generate

# Etapa 2: Producción minimalista
FROM node:20-alpine
WORKDIR /app
COPY rating-service/package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY rating-service/swagger/swagger.yaml ./swagger.yaml
EXPOSE 3000
CMD ["node", "dist/server.js"]
