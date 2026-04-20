FROM node:20-alpine
WORKDIR /app

# copy package metadata first for better layer caching
COPY package.json package-lock.json* ./

# prefer npm ci in CI, fallback to npm install if lockfile missing
RUN npm ci --only=production || npm install --only=production

# copy source
COPY index.js ./

EXPOSE 3006
CMD ["node", "index.js"]
