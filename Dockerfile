FROM node:20-alpine as build
WORKDIR /app
COPY package*.json /app/
RUN npm ci --no-audit
COPY ./ /app/
RUN npm run build:components-demo -- --output-path=./dist/out

FROM nginxinc/nginx-unprivileged:1.25-alpine
COPY --from=build /app/dist/out/browser/ /usr/share/nginx/html
COPY ./nginx.conf.template /etc/nginx/conf.d/default.conf
