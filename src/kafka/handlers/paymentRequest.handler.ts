import { EachMessagePayload } from "kafkajs";
import { getIO } from "../../config/socket.js";

async function paymentRequestHandler({ message }: EachMessagePayload) {
    try {
        const { rideData } = JSON.parse(message.value!.toString());
        const { userId } = rideData;

        const io = getIO();

        io.to(userId).emit("payment-request", { rideData });

    } catch (error) {
        throw new Error("Error in payment-request handler(gateway): " + (error as Error).message);
    }
}

export default paymentRequestHandler;