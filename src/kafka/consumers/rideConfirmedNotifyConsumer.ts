import { ride_confirmed_notify_user } from "../consumerInIt.js";
import rideConfirmedNotifyHandler from "../handlers/rideConfirmedNotifyHandler.js";

async function rideConfirmedNotifyUser() {
    try {
        await ride_confirmed_notify_user.subscribe({topic: "ride-confirmed-notify-user", fromBeginning: true});

        await ride_confirmed_notify_user.run({
            eachMessage: rideConfirmedNotifyHandler 
        });

    } catch (error) {
        throw new Error("Error in ride-confirmed-notify-consumer: " + (error as Error).message);
    }
}

export default rideConfirmedNotifyUser;