FROM node:20-alpine

WORKDIR /app

# Removed complex build deps for sqlite3 as we are now using postgres (pg)
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --ignore-engines

COPY . .

CMD ["npx", "nx", "serve", "api"]