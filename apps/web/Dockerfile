FROM node:20-alpine

# Set the pnpm home directory
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /app

# Copy root workspace and config files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/mock/package.json ./packages/mock/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
COPY backend/package.json ./backend/

# Install dependencies for the workspace
RUN pnpm install --frozen-lockfile

# Copy codebase contents
COPY . .

# Build the Next.js web application
RUN pnpm --filter web build

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

# Run Next.js start command
CMD ["pnpm", "--filter", "web", "start"]
