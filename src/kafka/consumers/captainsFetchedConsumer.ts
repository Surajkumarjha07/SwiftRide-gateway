import { captains_fetched_consumer } from "../consumerInIt.js";
import captainsFetchedHandler from "../handlers/captainsFetchedHandler.js";

async function captainsFetched() {
    try {
        await captains_fetched_consumer.subscribe({topic: "captains-fetched", fromBeginning: true});
        
        await captains_fetched_consumer.run({
            eachMessage: captainsFetchedHandler
        })

    } catch (error) {
        throw new Error("Error in captains-fetched consumer: " + (error as Error).message);
    }
}

export default captainsFetched;