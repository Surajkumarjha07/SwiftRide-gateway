import { ride_cancelled_notify_captain } from "../consumerInIt.js";
import rideCancelledHandler from "../handlers/rideCancelled.handler.js";

async function rideCancelled() {
    try {
        await ride_cancelled_notify_captain.subscribe({topic: "ride-cancelled-notify-captain", fromBeginning: true});

        await ride_cancelled_notify_captain.run({
            eachMessage: rideCancelledHandler
        })

    } catch (error) {
        throw new Error("Error in ride cancelled consumer(gateway): " + (error as Error).message);
    }
}

export default rideCancelled;