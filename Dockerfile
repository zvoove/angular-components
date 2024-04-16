FROM node:20.12-alpine as build
WORKDIR /app/src
COPY package*.json ./
RUN npm ci --no-audit
COPY . ./
RUN npm run build:components-demo -- --output-path=./dist/out

FROM node:20.12-alpine
WORKDIR /usr/app
COPY --from=build /app/src/dist/out ./

# with this the server runs unprivileged
USER node
CMD node server/server.mjs
EXPOSE 8080
