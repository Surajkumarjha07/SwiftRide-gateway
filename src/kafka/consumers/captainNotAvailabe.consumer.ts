import { captain_not_available } from "../consumerInIt.js";
import captainNotAvailableHandler from "../handlers/captainNotAvailable.handler.js";

async function captainNotAvailable() {
    try {
        await captain_not_available.subscribe({topic: "no-captain-found-notify-gateway", fromBeginning: true});

        await captain_not_available.run({
            eachMessage: captainNotAvailableHandler
        })

    } catch (error) {
            throw new Error("Error in getting captain-not-available request: " + (error as Error).message);
    }
}

export default captainNotAvailable;