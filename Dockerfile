FROM oven/bun:1.3.8

WORKDIR /app

COPY . .

RUN bun install --frozen-lockfile

RUN cd packages/cli && bun run build
RUN cd packages/types && bun run build
RUN cd packages/core && bun run build

RUN cd apps/api && bunx medusa build

RUN cd apps/api/.medusa/server && bun install

ENV NODE_ENV=production
ENV PORT=9000

EXPOSE 9000

CMD ["sh", "-c", "cd /app/apps/api/.medusa/server && bun run start"]
