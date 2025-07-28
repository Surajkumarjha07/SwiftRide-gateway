import { EachMessagePayload } from "kafkajs";
import { getIO } from "../../config/socket.js";

async function rideConfirmedNotifyHandler({ message }: EachMessagePayload) {
    try {
        const { rideData } = JSON.parse(message.value!.toString());
        const { userId } = rideData;

        const io = getIO();

        io.to(userId).emit("ride-confirmed", { rideData });

    } catch (error) {
        throw new Error("Error in ride-confirmed-notify-consumer: " + (error as Error).message);
    }
}

export default rideConfirmedNotifyHandler;