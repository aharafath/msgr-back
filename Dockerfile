# msgr-back/Dockerfile
FROM node:22

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the app
COPY . .

# Expose backend port
EXPOSE 5050

# Run the app
CMD ["npm", "run", "dev"]
