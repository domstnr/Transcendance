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

# RUN npm run build #start prod

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
#CMD ["sh", "-c", "tail -f /dev/null"]
