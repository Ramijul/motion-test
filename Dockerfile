# TODO: split into 2 stage
# Build on first stage
# copy dist folder in the second stage

FROM node:18-alpine3.19

RUN mkdir -p /usr/src
WORKDIR /usr/src

COPY package.json ./
COPY yarn.lock ./

RUN yarn
COPY . .

RUN yarn build

CMD yarn start