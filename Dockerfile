FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

RUN chown -R node:node /app

EXPOSE 3000

USER node

CMD ["node", "server.js"]
