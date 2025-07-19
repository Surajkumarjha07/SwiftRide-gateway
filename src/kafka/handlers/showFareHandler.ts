import { EachMessagePayload } from "kafkajs";
import { getIO } from "../../config/socket.js";

async function showFareHandler({ message }: EachMessagePayload) {
    try {
        const { fare, userId } = JSON.parse(message.value!.toString());

        console.log("fare: ", fare);
        const io = getIO();

        io.to(userId).emit("fare-fetched", { userId, fare });

    } catch (error) {
        if (error instanceof Error) {
            throw new Error("Error in getting show-fare handler: " + error.message);
        }
    }
}

export default showFareHandler;