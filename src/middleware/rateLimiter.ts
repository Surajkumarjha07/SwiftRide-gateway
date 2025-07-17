import { NextFunction, Request, Response } from "express";
import RateLimit from "../services/rateLimit.js";

const rateLimitMap = new Map<string, RateLimit>();

async function rateLimitMiddleware(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
        const ip = req.ip;

        if (!rateLimitMap.has(ip!)) {
            rateLimitMap.set(ip!, new RateLimit(5, 2000));

            setTimeout(() => {
                rateLimitMap.delete(ip!);
            }, 10 * (60 * 1000));
        }

        const rateLimit = rateLimitMap.get(ip!);

        const allowed = rateLimit?.removeToken();

        if (!allowed) {
            return res.status(429).json({
                error: "Too many requests!"
            });
        }

        return next();

    } catch (error) {
        throw new Error("Error in rate limit middleware: " + (error as Error).message);
    }
}

export default rateLimitMiddleware;