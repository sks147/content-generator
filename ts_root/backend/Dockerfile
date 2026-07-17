FROM node:26.5.0-slim

WORKDIR /shared
COPY shared/package.json shared/package-lock.json ./
RUN npm ci

WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm ci

COPY backend/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["sh", "-c", "npx tsc --build; npx tsc --build --watch & exec node --watch dist/server.js"]
