FROM node:26.5.0-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 5173

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npx", "vite", "dev", "--port", "5173", "--host", "0.0.0.0"]
