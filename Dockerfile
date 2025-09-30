FROM node:22-alpine AS builder

ARG VITE_DEPLOYMENT
ARG VITE_BACKEND_API_URL

ENV VITE_DEPLOYMENT=${VITE_DEPLOYMENT}
ENV VITE_BACKEND_API_URL=${VITE_BACKEND_API_URL}

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .

RUN npm run build

FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html

COPY server.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]