FROM node:20-alpine

WORKDIR /app

COPY api-gateway/package*.json ./
RUN npm install

COPY api-gateway/. ./

RUN chmod +x ./node_modules/.bin/tsc
RUN npm run build

EXPOSE 3005

CMD ["node", "dist/index.js"]
