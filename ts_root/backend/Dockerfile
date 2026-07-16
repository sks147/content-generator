FROM node:26.5.0-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["sh", "-c", "npx tsc; npx tsc --watch & exec node --watch dist/server.js"]
