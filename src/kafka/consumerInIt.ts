import kafka from "./kafkaClient.js";

const test_consumer = kafka.consumer({ groupId: "test-topic" });

async function consumerInit() {
    await Promise.all([
        test_consumer.connect()
    ]);
}

export { consumerInit, test_consumer };