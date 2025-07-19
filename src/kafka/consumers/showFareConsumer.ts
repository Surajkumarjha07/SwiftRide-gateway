import { show_fare_consumer } from "../consumerInIt.js";
import showFareHandler from "../handlers/showFareHandler.js";


async function showFare() {
    try {
        await show_fare_consumer.subscribe({ topic: "show-fare", fromBeginning: true});
        await show_fare_consumer.run({
            eachMessage: showFareHandler
        })
    } catch (error) {
        if (error instanceof Error) {
            throw new Error("Error in getting show-fare request: " + error.message);
        }
    }
}

export default showFare;