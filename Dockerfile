FROM node:24

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 5500

CMD ["npm", "start"]
