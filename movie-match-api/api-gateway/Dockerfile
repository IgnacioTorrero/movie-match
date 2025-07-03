# Etapa 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY api-gateway/package*.json ./
RUN npm ci
COPY api-gateway/. ./
RUN npm run build

# Etapa 2: Imagen final
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

EXPOSE 3005
CMD ["node", "dist/index.js"]
