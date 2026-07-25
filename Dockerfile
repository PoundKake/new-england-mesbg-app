# Both stages use the same alpine (musl) base so the `sharp` native binary
# installed during the build stage is actually compatible with the runtime
# stage it gets copied into — mismatched libc between build/runtime is a
# common footgun with native npm deps in multi-stage Docker builds.

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.output ./.output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
