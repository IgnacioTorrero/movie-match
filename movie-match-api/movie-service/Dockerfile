# Etapa 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY movie-service/package*.json ./
RUN npm ci
COPY movie-service/ ./
COPY prisma ./prisma

# 👇 Esta línea es clave para evitar el error 126
RUN chmod +x node_modules/.bin/*

RUN npm run build && npx prisma generate

# Etapa 2: Imagen final
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY movie-service/swagger/swagger.yaml ./swagger.yaml

# Comentar si se quiere usar la RDS BBDD de produccion
#COPY wait-for.sh /wait-for.sh
#RUN chmod +x /wait-for.sh
# Descomentar si se quiere usar la RDS BBDD de produccion
COPY wait-for-rds.sh /wait-for-rds.sh
RUN chmod +x /wait-for-rds.sh

EXPOSE 3000

# Comentar si se quiere usar la RDS BBDD de produccion
#CMD ["sh", "/wait-for.sh", "node", "dist/server.js"]
# Descomentar si se quiere usar la RDS BBDD de produccion
CMD ["sh", "/wait-for-rds.sh", "node", "dist/server.js"]