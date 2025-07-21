import { EachMessagePayload } from "kafkajs";
import { getIO } from "../../config/socket.js";

async function paymentProcessedNotifyCaptainHandler({ message }: EachMessagePayload) {
    try {
        const { fare, payment_id, orderId, order, userId, rideId, captainId } = JSON.parse(message.value!.toString());

        const io = getIO();

        io.to(captainId).emit("payment-processed", { fare, payment_id, orderId, order, userId, rideId, captainId })

    } catch (error) {
        throw new Error("Error in payment-processed-notify-captain handler: " + (error as Error).message);
    }
}

export default paymentProcessedNotifyCaptainHandler;