# syntax=docker/dockerfile:1

FROM node:22 AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps ./apps

RUN pnpm install --frozen-lockfile

RUN pnpm --filter @writer/reader-solid... build

FROM node:22-slim AS runner

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps ./apps
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["pnpm", "--filter", "@writer/reader-solid", "start"]
