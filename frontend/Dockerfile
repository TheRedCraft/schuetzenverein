FROM node:14
WORKDIR /app
# Copy package.json and package-lock.json (if available)
COPY package*.json ./
# Install dependencies
RUN npm install
# Copy the rest of the frontend code
COPY . .
# Build the React app
RUN npm run build
# Expose port 3000
EXPOSE 3000
# Start the app
CMD ["npm", "start"]
