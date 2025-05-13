# Frontend Dockerfile (auth-service/front-end/Dockerfile)
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm install -g typescript
RUN chmod +x ./node_modules/.bin/tsc ./node_modules/.bin/vite
RUN npm run build

# Etapa final: nginx
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
