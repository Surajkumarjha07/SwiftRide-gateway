import { payment_request_notify_user } from "../consumerInIt.js";
import paymentRequestHandler from "../handlers/paymentRequest.handler.js";

async function paymentRequest() {
    try {
        await payment_request_notify_user.subscribe({topic: "payment-requested-notify-user", fromBeginning: true});

        await payment_request_notify_user.run({
            eachMessage: paymentRequestHandler
        })

    } catch (error) {
        throw new Error("Error in payment-request consumer(gateway): " + (error as Error).message);
    }
}

export default paymentRequest;