# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY rating-service/package*.json ./
RUN npm ci
COPY rating-service/ ./
COPY prisma ./prisma
RUN npm run build && npx prisma generate

# Stage 2: Final image
FROM node:20-alpine
WORKDIR /app
COPY rating-service/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY rating-service/swagger/swagger.yaml ./swagger.yaml

# Comment out if you want to use the production RDS database
COPY wait-for.sh /wait-for.sh
RUN chmod +x /wait-for.sh
# Uncomment if you want to use the production RDS database
#COPY wait-for-rds.sh /wait-for-rds.sh
#RUN chmod +x /wait-for-rds.sh

EXPOSE 3000

# Comment out if you want to use the production RDS database
CMD ["sh", "/wait-for.sh", "node", "dist/server.js"]
# Uncomment if you want to use the production RDS database
#CMD ["sh", "/wait-for-rds.sh", "node", "dist/server.js"]