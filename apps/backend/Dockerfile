FROM node:22-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json apps/backend/package.json

RUN pnpm install

COPY . .

RUN pnpm --filter backend build

WORKDIR /app/apps/backend

EXPOSE 4000

CMD ["pnpm", "start:prod"]