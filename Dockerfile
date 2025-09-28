FROM node:22 AS builder
WORKDIR /app

ARG VITE_DEPLOYMENT
ARG VITE_BACKEND_API_URL

ENV VITE_DEPLOYMENT=$VITE_DEPLOYMENT
ENV VITE_BACKEND_API_URL=$VITE_BACKEND_API_URL

COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:22
WORKDIR /app
COPY --from=builder /app/.output ./.output

RUN chown -R node:node /app
USER node

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]