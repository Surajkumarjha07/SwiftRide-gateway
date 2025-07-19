import { Request, Response } from "express";
import coords from "../types/coordinates.js";
import { UserPayload } from "../types/payload.js";
import sendProducerMessage from "../kafka/producers/producerTemplate.js";

async function userLocationUpdate(req: Request, res: Response): Promise<any> {
    try {
        const { coordinates }: { coordinates: coords } = req.body;
        const { userId } = req.user as UserPayload;

        if (coordinates && userId) {
            await sendProducerMessage("user-location-update", { coordinates, userId });
            return res.status(200).json({
                message: "location update sent"
            });
        };

        return res.status(400).json({
            message: "coordinates or userId not available"
        })

    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({
                message: error.message || "Internal server error!"
            });
        }
    }
}

export default userLocationUpdate;