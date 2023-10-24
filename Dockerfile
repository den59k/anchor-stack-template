FROM node:18-alpine
WORKDIR /usr/app
COPY . .

RUN yarn install --frozen-lockfile
RUN yarn build:frontend
RUN yarn build:backend

RUN yarn install --production --frozen-lockfile

CMD node --enable-source-maps dist/backend/main.cjs