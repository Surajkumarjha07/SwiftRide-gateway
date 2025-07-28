import { EachMessagePayload } from "kafkajs";
import { getIO } from "../../config/socket.js";

async function showFareHandler({ message }: EachMessagePayload) {
    try {
        const { fareDetails, userId } = JSON.parse(message.value!.toString());

        console.log("fareDetails: ", fareDetails);
        const io = getIO();

        io.to(userId).emit("fare-fetched", { userId, fareDetails });

    } catch (error) {
        if (error instanceof Error) {
            throw new Error("Error in getting show-fare handler: " + error.message);
        }
    }
}

export default showFareHandler;