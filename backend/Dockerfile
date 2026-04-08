FROM node:20-alpine

WORKDIR /app

# Install dependencies first (layer cache)
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

EXPOSE 3001

# Hot reload in development
CMD ["npm", "run", "start:dev"]
