# Etapa 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

COPY auth-service/package*.json ./
RUN npm ci

COPY auth-service/ ./
COPY prisma ./prisma

RUN npm run build && npx prisma generate


# Etapa 2: Final (ligera, solo lo necesario para correr)
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

CMD ["node", "dist/server.js"]
