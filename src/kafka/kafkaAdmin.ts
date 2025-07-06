import kafka from "./kafkaClient.js";

async function kafkaInit() {
    const admin = kafka.admin();
    console.log("Admin connecting...");
    await admin.connect();
    console.log("Admin connected...");

    const topics = ["show-fare"];
    const existingTopics = await admin.listTopics();

    const topicsToCreate = topics.filter(t => !existingTopics.includes(t));

    if (topicsToCreate.length > 0) {
        await admin.createTopics({
            topics:
                topicsToCreate.map((t) => ({ topic: t, numPartitions: 1 })),
        })
    }

    console.log("Topics created!");

    await admin.disconnect();
}

export default kafkaInit;