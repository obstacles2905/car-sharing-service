FROM node:14-alpine as builder

WORKDIR /usr/src/app
COPY .. /usr/src/app

RUN npm ci --quiet && npm run build

FROM node:14-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --quiet --only=production

## We just need the build to execute the command
COPY .. .

EXPOSE 8080
CMD ["node", "./src/dist/server.js"]
