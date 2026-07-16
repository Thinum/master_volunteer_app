FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN sed -i "s|apiUrl: 'http://localhost:8080'|apiUrl: '/api'|" src/environments/environment.ts \
    && npm run build

FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/angular-frontend-new/browser /usr/share/nginx/html

EXPOSE 80

