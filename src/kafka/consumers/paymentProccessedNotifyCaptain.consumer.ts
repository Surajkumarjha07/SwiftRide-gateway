import { payment_processed_notify_captain } from "../consumerInIt.js";
import paymentProcessedNotifyCaptainHandler from "../handlers/paymentProcessedNotifyCaptain.handler.js";

async function paymentProcessedNotifyCaptain() {
    try {
        await payment_processed_notify_captain.subscribe({topic: "payment-processed-notify-captain", fromBeginning: true});

        await payment_processed_notify_captain.run({
            eachMessage: paymentProcessedNotifyCaptainHandler
        })
        
    } catch (error) {
        throw new Error("Error in payment-processed-notify-captain: " + (error as Error).message);
    }
}

export default paymentProcessedNotifyCaptain;