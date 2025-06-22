import { ExtendedError, Socket } from "socket.io";
import jwt from "jsonwebtoken";

async function handleSocketAuth(socket: Socket, next: (error?: ExtendedError) => void) {
    const token: string = socket.handshake.auth?.token;
    const role: string = socket.handshake.auth?.role;

    if (!token || !role) {
        return next(new Error("Token or role is not available!"));
    }

    const secret_key: string = (role === "user" ? process.env.USER_JWT_SECRET! : process.env.CAPTAIN_JWT_SECRET!);

    try {
        const payload = jwt.verify(token, secret_key);

        socket.data.user = payload;
        socket.data.role = role;

        return next();

    } catch (error) {
        return next(new Error("Invalid token: " + (error as Error).message));
    }
}

export default handleSocketAuth;