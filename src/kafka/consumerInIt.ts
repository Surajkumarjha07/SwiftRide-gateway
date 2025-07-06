import kafka from "./kafkaClient.js";

const show_fare_consumer = kafka.consumer({ groupId: "show-fare-group" });
const captains_fetched_consumer = kafka.consumer({ groupId: "captains-fetched-group" });
const captain_not_available = kafka.consumer({ groupId: "captain-not-available" });

async function consumerInit() {
    await Promise.all([
        show_fare_consumer.connect(),
        captains_fetched_consumer.connect(),
        captain_not_available.connect()
    ]);
}

export { consumerInit, show_fare_consumer, captains_fetched_consumer, captain_not_available };