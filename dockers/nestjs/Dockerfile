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

COPY trancendence/. .

ENV DATABASE_URL postgresql://postgresql:postgresql@postgresql:5432/postgresql

RUN npm install
RUN npm install @prisma/client prisma
RUN npx prisma generate
RUN npx prisma migrate dev --name init
RUN npx prisma studio

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
#CMD ["sh", "-c", "tail -f /dev/null"]
