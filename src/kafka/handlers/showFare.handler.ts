import { EachMessagePayload } from "kafkajs";
import { getIO } from "../../config/socket.js";

async function showFareHandler({ message }: EachMessagePayload) {
    try {
        const { fareDetails, userId } = JSON.parse(message.value!.toString());

        console.log("fareDetails: ", fareDetails);
        const io = getIO();

        console.log("io instance exists:", !!io);
        console.log("Connected socket IDs:", Array.from(io.sockets.sockets.keys()));
        console.log("Rooms:", Array.from(io.sockets.adapter.rooms.keys()));
        console.log("Emitting to userId:", userId, typeof userId);

        io.to(userId).emit("fare-fetched", { userId, fareDetails });

    } catch (error) {
        console.error("showFareHandler error:", error); // <-- also add this, your current catch swallows/rethrows without logging
        if (error instanceof Error) {
            throw new Error("Error in getting show-fare handler: " + error.message);
        }
    }
}

export default showFareHandler;