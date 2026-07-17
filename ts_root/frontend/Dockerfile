FROM node:26.5.0-slim

WORKDIR /shared
COPY shared/package.json shared/package-lock.json ./
RUN npm ci

WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 5173

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npx", "vite", "dev", "--port", "5173", "--host", "0.0.0.0"]
