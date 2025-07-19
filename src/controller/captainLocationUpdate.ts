import { Request, Response } from "express";
import sendProducerMessage from "../kafka/producers/producerTemplate.js";
import { CaptainPayload } from "../types/payload.js";
import coords from "../types/coordinates.js";

async function captainLocationUpdate(req: Request, res: Response): Promise<any> {
    try {
        const { coordinates }: { coordinates: coords } = req.body;
        const { captainId } = req.captain as CaptainPayload;

        if (coordinates && captainId) {
            await sendProducerMessage("captain-location-update", { coordinates, captainId });
            return res.status(200).json({
                message: "location update sent"
            });
        };

        return res.status(400).json({
            message: "coordinates or captainId not available"
        })

    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({
                message: error.message || "Internal server error!"
            });
        }
    }
}

export default captainLocationUpdate;