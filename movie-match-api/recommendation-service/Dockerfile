# Etapa 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Solo instalás dependencias necesarias para compilar
COPY recommendation-service/package*.json ./
RUN npm ci

# Copiás el resto del código y Prisma
COPY recommendation-service/ ./
COPY prisma ./prisma

# Build TypeScript y generar Prisma Client
RUN npm run build && npx prisma generate

# Etapa 2: Imagen final mínima
FROM node:20-alpine

WORKDIR /app

# Solo instalás dependencias de producción
COPY recommendation-service/package*.json ./
RUN npm ci --omit=dev

# Copiás lo estrictamente necesario
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY recommendation-service/swagger/swagger.yaml ./swagger.yaml

EXPOSE 3000

CMD ["node", "dist/server.js"]
