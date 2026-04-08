FROM node:20-alpine

WORKDIR /app

# Install dependencies first (layer cache)
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

EXPOSE 5173

# Hot reload in development - bind to all interfaces for Docker
CMD ["npm", "run", "dev"]
