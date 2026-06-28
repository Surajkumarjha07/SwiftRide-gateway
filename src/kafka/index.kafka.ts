import { consumerInit } from "./consumerInIt.js";
import captainNotAvailable from "./consumers/captainNotAvailabe.consumer.js";
import captainsFetched from "./consumers/captainsFetched.consumer.js";
import paymentProcessedNotifyCaptain from "./consumers/paymentProccessedNotifyCaptain.consumer.js";
import paymentRequest from "./consumers/paymentRequested.consumer.js";
import rideCancelled from "./consumers/rideCancelled.consumer.js";
import rideConfirmedNotifyUser from "./consumers/rideConfirmedNotify.consumer.js";
import showFare from "./consumers/showFare.consumer.js";
import kafkaInit from "./kafkaAdmin.js";
import { producerInit } from "./producerInIt.js";

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000;

const startKafka = async () => {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            await kafkaInit();

            console.log("Consumer initialization...");
            await consumerInit();
            console.log("Consumer initialized...");

            console.log("Producer initialization...");
            await producerInit();
            console.log("Producer initialized.");

            // Listening to incoming events
            await showFare();
            await captainsFetched();
            await captainNotAvailable();
            await rideConfirmedNotifyUser();
            await rideCancelled();
            await paymentRequest();
            await paymentProcessedNotifyCaptain();

            console.log("Kafka initialized successfully.");
            return;
        } catch (error) {
            console.error(
                `Kafka initialization failed (${attempt}/${MAX_RETRIES})`,
                error
            );

            if (attempt === MAX_RETRIES) {
                console.error("Maximum retry attempts reached.");
                throw error;
            }

            console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
    }
};

export default startKafka;