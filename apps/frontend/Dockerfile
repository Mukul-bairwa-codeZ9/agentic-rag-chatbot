FROM node:22-alpine
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/frontend/package.json apps/frontend/package.json
RUN pnpm install
COPY . .
RUN pnpm --filter frontend build
WORKDIR /app/apps/frontend
EXPOSE 3000
CMD ["pnpm", "start"]