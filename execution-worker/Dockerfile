FROM node:20-alpine

# Docker CLI + sqlite3 (in-container SQL judging)
RUN apk add --no-cache docker-cli sqlite

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . .

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN mkdir -p /usr/src/app/temp && chown -R appuser:appgroup /usr/src/app

EXPOSE 4000

CMD ["node", "src/index.js"]
