import { Server } from "socket.io";

let io: Server;

function InitializeSocket(httpServer: any, corsOptions: any) {
    io = new Server(httpServer, {
        cors: corsOptions
    })

    return io;
}

function getIO() {
    if (!io) throw new Error(`Socket not initialized!`)
    return io;
}

export { InitializeSocket, getIO };