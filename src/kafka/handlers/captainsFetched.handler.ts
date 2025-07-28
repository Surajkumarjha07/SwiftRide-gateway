import { EachMessagePayload } from "kafkajs";
import { getIO } from "../../config/socket.js";

async function captainsFetchedHandler({ message }: EachMessagePayload) {
    try {
        const { captains, rideData } = JSON.parse(message.value!.toString());

        console.log('captains: ', captains);

        const io = getIO();

        for (const captain of captains) {
            let { captainId } = captain;
            io.to(captainId).emit("accept-ride", { captain, rideData });
        }

    } catch (error) {
        throw new Error("Error in captains-fetched handler: " + (error as Error).message);
    }
}

export default captainsFetchedHandler;