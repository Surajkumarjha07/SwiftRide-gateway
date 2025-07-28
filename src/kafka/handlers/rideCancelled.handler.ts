import { EachMessagePayload } from "kafkajs";
import { getIO } from "../../config/socket.js";
import redis from "../../config/redis.js";

async function rideCancelledHandler({ message }: EachMessagePayload) {
    try {
        const { rideData } = JSON.parse(message.value!.toString());
        const { rideId, captainId } = rideData;

        const io = getIO();

        io.to(captainId).emit("ride-cancelled", { rideData });

        await redis.del(`ride:${rideId}`);

    } catch (error) {
        throw new Error("Error in getting ride-cancelled handler(gateway): " + (error as Error).message);
    }
}

export default rideCancelledHandler;