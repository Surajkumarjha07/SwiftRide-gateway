import { consumerInit } from "./consumerInIt.js";
import captainNotAvailable from "./consumers/captainNotAvailabeConsumer.js";
import captainsFetched from "./consumers/captainsFetchedConsumer.js";
import paymentProcessedNotifyCaptain from "./consumers/paymentProccessedNotifyCaptain.js";
import paymentRequest from "./consumers/paymentRequested.js";
import rideCancelled from "./consumers/rideCancelledConsumer.js";
import rideConfirmedNotifyUser from "./consumers/rideConfirmedNotifyConsumer.js";
import showFare from "./consumers/showFareConsumer.js";
import kafkaInit from "./kafkaAdmin.js";
import { producerInit } from "./producerInIt.js";

const startKafka = async () => {
    try {
        await kafkaInit();

        console.log("Consumer initialization...");
        await consumerInit();
        console.log("Consumer initialized...");

        console.log("Producer initialization...");
        await producerInit();
        console.log("Producer initializated");

        // Listening to incoming events
        await showFare();
        await captainsFetched();
        await captainNotAvailable();
        await rideConfirmedNotifyUser();
        await rideCancelled();
        await paymentRequest();
        await paymentProcessedNotifyCaptain();

    } catch (error) {
        console.log("error in initializing kafka: ", error);
    }
}

export default startKafka;