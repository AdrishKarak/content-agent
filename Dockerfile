# ────────────────────────────────────────────────────────────
# AI Content Studio — Production Multi-Stage Dockerfile
# Optimized for Next.js 15 Standalone + Prisma + pgvector
# ────────────────────────────────────────────────────────────

FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable && corepack prepare pnpm@latest --activate

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml* .npmrc* ./
COPY prisma ./prisma/

RUN pnpm install --frozen-lockfile

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN pnpm prisma generate

# Build Next.js with standalone output
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mock?sslmode=disable"
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_bW9jay1jbGVyay1rZXktZm9yLWNpLWJ1aWxkLmNsZXJrLmFjY291bnRzLmRldiQ"
ENV CLERK_SECRET_KEY="sk_test_mock_clerk_secret_key_for_ci_build"
ENV GEMINI_API_KEY="mock_gemini_key_for_docker_build"
RUN pnpm build

# Stage 3: Minimal Production Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy static assets and standalone server
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Automatically set up permissions for Next.js cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
