import { CaptainPayload, UserPayload } from "./types/payload.type.js"

declare module 'express-serve-static-core' {
    interface Request {
        captain?: CaptainPayload,
        user?: UserPayload
    }
}