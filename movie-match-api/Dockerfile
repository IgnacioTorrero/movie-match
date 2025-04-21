# Usa imagen liviana de Node
FROM node:20-alpine

# Define el directorio de trabajo
WORKDIR /app

# Copia y instala dependencias
COPY package*.json ./
RUN npm install

# Copia todo el código
COPY . .

# Compila el proyecto TypeScript
RUN npm run build

# Genera Prisma Client
RUN npx prisma generate

# Expone el puerto 3000 (usado internamente, luego se mapea a 3002 afuera)
EXPOSE 3000

# Comando final: aplica migraciones y ejecuta la app compilada
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
