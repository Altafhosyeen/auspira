# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
# The postinstall script (copy-pdf-worker.mjs) runs during `npm ci`, so the
# scripts/ dir must be present before install — before the full `COPY . .`.
COPY scripts ./scripts

# Install all dependencies (including dev) needed for build.
# Retry flags ride out transient registry connection drops on the CI agent.
# LEFTHOOK=0 tells the prepare script to skip git-hook setup — there is no
# .git in the Docker context, and lefthook install exits 128 without one.
ENV LEFTHOOK=0
RUN npm ci --fetch-retries=5 --fetch-retry-maxtimeout=120000

COPY . .

# Build-time public env vars — baked into the JS bundle by Next.js.
# Passed via --build-arg from the CI pipeline (Docker@2 task `arguments` field).
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_ENVIRONMENT
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_ENVIRONMENT=$NEXT_PUBLIC_ENVIRONMENT

# Build the Next.js app with standalone output (skips quality checks — CI handles those)
RUN npx next build

# Stage 2: Production (minimal standalone image)
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Standalone output + static assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Next.js standalone server entrypoint
CMD ["node", "server.js"]