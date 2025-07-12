import { EachMessagePayload } from "kafkajs";
import { getIO } from "../../config/socket.js";

async function rideCancelledHandler({ message }: EachMessagePayload) {
    try {
        const { rideData } = JSON.parse(message.value!.toString());
        const { captainId } = rideData;

        const io = getIO();

        io.to(captainId).emit("ride-cancelled", { rideData });

    } catch (error) {
        throw new Error("Error in getting ride-cancelled handler(gateway): " + (error as Error).message);
    }
}

export default rideCancelledHandler;