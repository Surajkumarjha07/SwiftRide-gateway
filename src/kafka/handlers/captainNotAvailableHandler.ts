import { EachMessagePayload } from "kafkajs";
import { getIO } from "../../config/socket.js";

async function captainNotAvailableHandler({ message }: EachMessagePayload) {
    try {
        const { rideData } = JSON.parse(message.value!.toString());
        const { userId } = rideData;

        const io = getIO();

        io.to(userId).emit("no-captain-found", { rideData });

    } catch (error) {
        throw new Error("Error in getting captain-not-available handler: " + (error as Error).message);
    }
}

export default captainNotAvailableHandler;