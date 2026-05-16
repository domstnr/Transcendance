# FROM alpine:3.23
FROM node:20-bookworm-slim

# RUN apk update && apk add --no-cache \
#     nodejs \
#     npm \
#     yarn \
#     git \
#     build-base \
#     linux-headers

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .
COPY entrypoint-backend.sh /usr/local/bin/entrypoint-backend.sh

RUN chmod +x /usr/local/bin/entrypoint-backend.sh

EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/entrypoint-backend.sh"]
CMD ["npm", "run", "start:dev"]
