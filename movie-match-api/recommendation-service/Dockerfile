FROM node:20-alpine

WORKDIR /app

# Copiamos dependencias y las instalamos
COPY package*.json ./
RUN npm install

# Copiamos solo el código ya compilado y otros archivos necesarios
COPY dist ./dist
COPY prisma ./prisma
COPY .env .env

# Generamos Prisma Client sin recompilar nada
RUN npx prisma generate

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
