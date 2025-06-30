# Etapa 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Instalamos dependencias necesarias para compilar
COPY api-gateway/package*.json ./
RUN npm ci

# Copiamos el código fuente
COPY api-gateway/. ./

# Compilamos TypeScript
RUN npm run build

# Etapa 2: Imagen final mínima
FROM node:20-alpine

WORKDIR /app

# Solo copiamos lo necesario
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3005

CMD ["node", "dist/index.js"]
