import kafka from "./kafkaClient.js";

const show_fare_consumer = kafka.consumer({ groupId: "show-fare-group" });
const captains_fetched_consumer = kafka.consumer({ groupId: "captains-fetched-group" });
const captain_not_available = kafka.consumer({ groupId: "captain-not-available" });
const ride_confirmed_notify_user = kafka.consumer({ groupId: "ride-confirmed-notify-user-group" });
const ride_cancelled_notify_captain = kafka.consumer({ groupId: "ride-cancelled-notify-captain-group" });
const payment_request_notify_user = kafka.consumer({ groupId: "payment-request-notify-user-group" })
const payment_processed_notify_captain = kafka.consumer({groupId: "payment-processed-notify-captain"});

async function consumerInit() {
    await Promise.all([
        show_fare_consumer.connect(),
        captains_fetched_consumer.connect(),
        captain_not_available.connect(),
        ride_confirmed_notify_user.connect(),
        ride_cancelled_notify_captain.connect(),
        payment_request_notify_user.connect(),
        payment_processed_notify_captain.connect()
    ]);
}

export { consumerInit, show_fare_consumer, captains_fetched_consumer, captain_not_available, ride_confirmed_notify_user, ride_cancelled_notify_captain, payment_request_notify_user, payment_processed_notify_captain };