🌐 Gateway Service

The Gateway Service acts as a proxy server for SwiftRide (Ride-Sharing platform), directing client requests to the appropriate internal microservices. It is responsible for seamless communication between the client and different backend services.

-----------------------------------------------------------------------------------------------------------------------------------------------

🚀 Features

✅ Acts as a proxy for client requests  
✅ Direct request to appropriate internal microservices  
✅ Integrated with Socket.IO for real-time updates to the client  
✅ Integrated with Rate-Limiter (Token Bucket Algorithm) to prevent the server from being exploited by a single user or captain  

-----------------------------------------------------------------------------------------------------------------------------------------------

🛠 Technologies Used

✅ Node.js  
✅ Express  
✅ TypeScript  
✅ Kafka  
✅ Docker  
✅ Redis  
✅ Socket IO  

-----------------------------------------------------------------------------------------------------------------------------------------------

📋 Prerequisites

Ensure you have the following installed ->  
Node.js (for JavaScript/TypeScript backend)  
Express  

Required Packages ->  
cors  
express-http-proxy  
nodemon  
kafkajs  
ioredis  
socket.io  
tsup (for TypeScript)  
typescript (for TypeScript)  
concurrently (for TypeScript)  

Ensure you have the following tools running in your local machine ->  
Confluent Kafka Docker Image  
Redis Docker Image  

-----------------------------------------------------------------------------------------------------------------------------------------------

📌 Steps to Run

1️⃣ Clone the repository

git clone https://github.com/Surajkumarjha07/SwiftRide-gateway.git

2️⃣ Install Dependencies

npm install

3️⃣ Set Up Environment Variables

Create a .env file and configure the following variables ->  

PORT=your-port-number  
USER_JWT_SECRET=your-jwt-secret  
CAPTAIN_JWT_SECRET=your-jwt-secret  

4️⃣ Run the Application

nodemon index.js

🚀 Your Gateway Service is now up and running! 🎉

