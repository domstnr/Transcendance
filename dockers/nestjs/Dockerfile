FROM alpine:3.23

RUN apk update && apk add --no-cache \
    nodejs \
    npm \
    yarn \
    git \
    build-base \
    linux-headers

WORKDIR /usr/src/app

COPY trancendence/package*.json ./

RUN npm install

COPY trancendence/. .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
#CMD ["sh", "-c", "tail -f /dev/null"]