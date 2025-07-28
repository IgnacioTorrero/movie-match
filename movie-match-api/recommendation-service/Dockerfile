# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY recommendation-service/package*.json ./
RUN npm ci
COPY recommendation-service/ ./
COPY prisma ./prisma
RUN npm run build && npx prisma generate

# Stage 2: Final image
FROM node:20-alpine
WORKDIR /app
COPY recommendation-service/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY recommendation-service/swagger/swagger.yaml ./swagger.yaml

# Comment if using the production RDS database
COPY wait-for.sh /wait-for.sh
RUN chmod +x /wait-for.sh
# Uncomment if using the production RDS database
#COPY wait-for-rds.sh /wait-for-rds.sh
#RUN chmod +x /wait-for-rds.sh

EXPOSE 3000

# Comment if using the production RDS database
CMD ["sh", "/wait-for.sh", "node", "dist/server.js"]
# Uncomment if using the production RDS database
#CMD ["sh", "/wait-for-rds.sh", "node", "dist/server.js"]