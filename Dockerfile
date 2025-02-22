FROM docker.io/library/node:22.9-alpine AS prepare

RUN apk add chromium
ENV CHROME_BIN=/usr/bin/chromium-browser

FROM prepare AS build
WORKDIR /app/src
COPY package*.json ./
RUN npm ci --no-audit
COPY . ./

FROM build AS test-components

ENTRYPOINT ["npm", "run", "test:components"]

FROM build AS test-schematics
ENTRYPOINT ["npm", "run", "test:schematics"]

FROM build AS linter
ENTRYPOINT ["npm", "run", "lint"]

FROM build AS build-demo
RUN npm run build:components-demo -- --output-path=./dist/out

FROM acrzvoovesaasdev.azurecr.io/docker.io/library/node:22.9-alpine
WORKDIR /usr/app
COPY --from=build-demo /app/src/dist/out ./

# with this the server runs unprivileged
USER node
CMD node server/server.mjs
EXPOSE 8080
