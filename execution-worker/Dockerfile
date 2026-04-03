FROM node:20-alpine

# Install docker CLI
RUN apk add --no-cache docker-cli

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4000

CMD ["node", "src/index.js"]
