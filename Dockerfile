# node image
FROM node:20-slim

# working directory
WORKDIR /app

# copying package files
COPY package*.json ./

# installing dependencies
RUN npm install --omit=dev && npm cache clean --force

# copying all files
COPY . .

# exposing port to 4000
EXPOSE 4000

# cmd command
CMD [ "npm", "start" ]