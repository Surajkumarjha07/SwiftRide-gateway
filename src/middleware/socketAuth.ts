import { ExtendedError, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import cookie from "cookie";

async function handleSocketAuth(socket: Socket, next: (error?: ExtendedError) => void) {
    let token: string | undefined;
    const role: string = socket.handshake.auth?.role;

    if (socket.handshake.auth?.token) {
        token = socket.handshake.auth.token;
    }
    else if (socket.handshake.headers.cookie) {
        token = cookie.parse(socket.handshake.headers.cookie!).authToken;
    }

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