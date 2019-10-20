FROM node:alpine

RUN yarn global add loopback-cli

WORKDIR /opt/project/app

EXPOSE 3000
