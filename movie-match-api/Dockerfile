FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm install -g typescript && \
    npm run build && \
    chmod +x ./node_modules/.bin/prisma && \
    ./node_modules/.bin/prisma generate

EXPOSE 3000

# Ejecuta migraciones SOLO cuando arranca el contenedor, no antes
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/server.js"]
