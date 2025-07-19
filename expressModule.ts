import { CaptainPayload, UserPayload } from "./src/types/payload.js"

declare module 'express-serve-static-core' {
    interface Request {
        captain?: CaptainPayload,
        user?: UserPayload
    }
}